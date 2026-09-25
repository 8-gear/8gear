import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import client from '@/lib/paypal';
import connectDB from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmationEmail';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { orderID } = await req.json();

    if (!orderID) {
      return NextResponse.json({ error: 'Missing orderID' }, { status: 400 });
    }

    // 1. Capture PayPal Order
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const response = await client().execute(request);

    if (response.result.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'PayPal payment not completed' }, { status: 400 });
    }

    const capture = response.result.purchase_units[0].payments.captures[0];
    const captureId = capture.id;

    // 2. Find Order by paypalOrderId
    const order = await Order.findOne({ 'payment.paypalOrderId': orderID });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const shouldSendConfirmationEmail = !order.orderConfirmationEmailSentAt;

    // 3. Update order status
    if (order.payment.paymentStatus !== 'paid') {
      order.payment.paymentStatus = 'paid';
      order.payment.paypalCaptureId = captureId;
      order.payment.paymentProviderId = captureId;
      order.orderStatus = 'payment_confirmed';
      order.trackingTimeline.push({
        status: 'payment_confirmed',
        message: 'PayPal payment confirmed successfully.',
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


    // 4. Reduce stock only if not already reduced
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

    return NextResponse.json({
      orderId: order.orderId,
      trackingId: order.trackingId,
      paymentStatus: order.payment.paymentStatus,
      orderStatus: order.orderStatus,
      totalAmount: order.amounts.totalAmount,
      currency: order.amounts.currency,
    });
  } catch (error: any) {
    console.error('PayPal Capture Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
