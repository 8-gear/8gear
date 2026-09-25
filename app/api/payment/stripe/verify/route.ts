import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmationEmail';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { session_id } = await req.json();

    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // 1. Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Find Order by stripeSessionId
    const order = await Order.findOne({ 'payment.stripeSessionId': session_id });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 3. If already paid and stock reduced, just return
    if (order.payment.paymentStatus === 'paid' && order.stockReduced) {
      return NextResponse.json({
        orderId: order.orderId,
        trackingId: order.trackingId,
        paymentStatus: order.payment.paymentStatus,
        orderStatus: order.orderStatus,
        totalAmount: order.amounts.totalAmount,
        currency: order.amounts.currency,
      });
    }

    // 4. Check payment status
    if (session.payment_status === 'paid') {
      const shouldSendConfirmationEmail = !order.orderConfirmationEmailSentAt;

      // Update order status if not already paid
      if (order.payment.paymentStatus !== 'paid') {
        order.payment.paymentStatus = 'paid';
        order.payment.paymentProviderId = session.payment_intent as string;
        order.orderStatus = 'payment_confirmed';
        order.trackingTimeline.push({
          status: 'payment_confirmed',
          message: 'Payment confirmed successfully.',
          timestamp: new Date(),
          updatedBy: 'system',
        });
      }

      // Update linked CheckoutLead if exists
      if (order.linkedCheckoutLeadId) {
        const CheckoutLead = (await import('@/models/CheckoutLead')).default;
        await CheckoutLead.findOneAndUpdate(
          { leadId: order.linkedCheckoutLeadId },
          { 
            status: 'paid',
            linkedOrderId: order.orderId,
            lastActivityAt: new Date()
          }
        );
      }

      // 5. Reduce stock only if not already reduced
      if (!order.stockReduced) {
        for (const item of order.items) {
          const product = await Product.findById(item.productId);
          if (product) {
            // @ts-ignore
            const variant = product.variants.id(item.variantId);
            if (variant) {
              variant.stockQuantity = Math.max(0, variant.stockQuantity - item.quantity);
              product.analytics.totalSold += item.quantity;
              await product.save();
            }
          }
        }
        order.stockReduced = true;
      }

      await order.save();

      if (shouldSendConfirmationEmail) {
        try {
          await sendOrderConfirmationEmail(order);
        } catch (emailError) {
          console.error('[Email] Failed to send order confirmation email:', emailError);
        }
      }
    }

    return NextResponse.json({
      orderId: order.orderId,
      trackingId: order.trackingId,
      paymentStatus: order.payment.paymentStatus,
      orderStatus: order.orderStatus,
      totalAmount: order.amounts.totalAmount,
      currency: order.amounts.currency,
    });
  } catch (error: any) {
    console.error('Stripe Verify Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
