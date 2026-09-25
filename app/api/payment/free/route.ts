import { sendOrderEmail } from '@/lib/email/sendOrderEmail';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Product, { IVariant } from '@/models/Product';
import CheckoutLead from '@/models/CheckoutLead';
import { buildCheckoutOrderItems } from '@/lib/checkout/buildCheckoutOrderItems';
import { generateOrderId, generateTrackingId } from '@/lib/checkout/idGenerators';
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmationEmail';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { items, customer, shippingAddress, leadId } = await req.json();

    if (!Array.isArray(items) || items.length === 0 || !customer || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prices must always be rebuilt from the database; never trust the cart total.
    const checkoutData = await buildCheckoutOrderItems(items);

    if (checkoutData.totalAmount !== 0) {
      return NextResponse.json(
        { error: 'This order is not free. Please select a payment method.' },
        { status: 400 }
      );
    }

    const orderId = await generateOrderId();
    const trackingId = await generateTrackingId();

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
        paymentMethod: 'Free',
        paymentStatus: 'paid',
        paymentProviderId: 'FREE_ORDER',
      },
      linkedCheckoutLeadId: leadId,
      orderStatus: 'payment_confirmed',
      fulfillmentStatus: 'pending',
      stockReduced: true,
      trackingTimeline: [
        {
          status: 'order_received',
          message: 'Your order has been received.',
          updatedBy: 'system',
        },
        {
          status: 'payment_confirmed',
          message: 'Free order confirmed. No payment was required.',
          updatedBy: 'system',
        },
      ],
    });

    await sendOrderEmail('new_order', order);

    for (const item of checkoutData.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const variant = product.variants.find(
        (candidate: IVariant) => candidate.sku === item.sku
      );
      if (variant) {
        variant.stockQuantity = Math.max(0, variant.stockQuantity - item.quantity);
        product.analytics.totalSold += item.quantity;
        await product.save();
      }
    }

    if (leadId) {
      await CheckoutLead.findOneAndUpdate(
        { leadId },
        {
          status: 'paid',
          linkedOrderId: order.orderId,
          lastActivityAt: new Date(),
        }
      );
    }

    try {
      await sendOrderConfirmationEmail(order);
    } catch (emailError) {
      console.error('[Email] Failed to send free order confirmation email:', emailError);
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
    console.error('Free Order Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
