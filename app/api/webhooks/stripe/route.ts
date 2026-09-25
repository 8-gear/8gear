import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Stripe from 'stripe';
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmationEmail';

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const session_id = session.id;

    try {
      await connectDB();
      const order = await Order.findOne({ 'payment.stripeSessionId': session_id });

      if (order) {
        if (session.payment_status === 'paid') {
          const shouldSendConfirmationEmail = !order.orderConfirmationEmailSentAt;

          // Update order status if not already paid
          if (order.payment.paymentStatus !== 'paid') {
            order.payment.paymentStatus = 'paid';
            order.payment.paymentProviderId = session.payment_intent as string;
            order.orderStatus = 'payment_confirmed';
            order.trackingTimeline.push({
              status: 'payment_confirmed',
              message: 'Payment confirmed successfully via webhook.',
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

          // Reduce stock only if not already reduced
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
      }
    } catch (dbError) {
      console.error('Webhook DB Error:', dbError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
