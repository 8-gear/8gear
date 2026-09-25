import { sendOrderEmail } from '@/lib/email/sendOrderEmail';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import type { IVariant } from '@/models/Product';
import CheckoutLead from '@/models/CheckoutLead';
import Subscriber from '@/models/Subscriber';
import { buildCheckoutOrderItems } from '@/lib/checkout/buildCheckoutOrderItems';
import { generateOrderId, generateTrackingId } from '@/lib/checkout/idGenerators';
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmationEmail';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { items, customer, shippingAddress, leadId, subscribe } = await req.json();

    if (!items || !customer || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Build and validate items from DB
    const checkoutData = await buildCheckoutOrderItems(items);

    // 2. Generate unique IDs
    const orderId = await generateOrderId();
    const trackingId = await generateTrackingId();

    // 3. Create Paid Order in MongoDB
    const order = await Order.create({
      orderId,
      trackingId,
      customerInfo: customer,
      shippingAddress,
      items: checkoutData.items,
      amounts: {
        subtotal: checkoutData.subtotal,
        shippingAmount: checkoutData.shippingAmount,
        totalAmount: checkoutData.totalAmount,
        currency: checkoutData.currency,
      },
      payment: {
        paymentMethod: 'Test',
        paymentStatus: 'paid',
        paymentProviderId: 'TEST_PAYMENT',
      },
      linkedCheckoutLeadId: leadId,
      orderStatus: 'payment_confirmed',
      fulfillmentStatus: 'pending',
      stockReduced: true,
      trackingTimeline: [
        {
          status: 'order_received',
          message: 'Your order has been received.',
          timestamp: new Date(),
          updatedBy: 'system',
        },
        {
          status: 'payment_confirmed',
          message: 'Test payment confirmed successfully.',
          timestamp: new Date(),
          updatedBy: 'system',
        },
      ],
    });

    await sendOrderEmail('new_order', order);

    // 4. Reduce Stock and Increase totalSold
    for (const item of checkoutData.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const variant = product.variants.find((candidate: IVariant) => candidate.sku === item.sku);
        if (variant) {
          variant.stockQuantity = Math.max(0, variant.stockQuantity - item.quantity);
          product.analytics.totalSold += item.quantity;
          await product.save();
        }
      }
    }

    // 5. Update Lead if exists
    if (leadId) {
      await CheckoutLead.findOneAndUpdate(
        { leadId },
        { 
          status: 'paid',
          linkedOrderId: order.orderId,
          selectedPaymentMethod: 'unknown', // User didn't pick Stripe/PayPal
          lastActivityAt: new Date()
        }
      );
    }

    // 6. Handle Subscriber if true
    if (subscribe) {
      await Subscriber.findOneAndUpdate(
        { email: customer.email.toLowerCase() },
        {
          $set: {
            name: customer.name,
            phone: customer.phone,
            source: 'checkout',
            subscribed: true,
            lastSubscribedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    try {
      await sendOrderConfirmationEmail(order);
    } catch (emailError) {
      console.error('[Email] Failed to send test order confirmation email:', emailError);
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      trackingId: order.trackingId,
      paymentStatus: order.payment.paymentStatus,
      orderStatus: order.orderStatus,
      totalAmount: order.amounts.totalAmount,
      currency: order.amounts.currency,
    });
  } catch (error: unknown) {
    console.error('Test Payment Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
