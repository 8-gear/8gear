import { sendOrderEmail } from '@/lib/email/sendOrderEmail';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/db/mongodb';
import Order from '@/models/Order';
import { buildCheckoutOrderItems } from '@/lib/checkout/buildCheckoutOrderItems';
import { generateOrderId, generateTrackingId } from '@/lib/checkout/idGenerators';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { items, customer, shippingAddress, leadId } = await req.json();

    if (!items || !customer || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Build and validate items from DB
    const checkoutData = await buildCheckoutOrderItems(items);

    if (checkoutData.totalAmount === 0) {
      return NextResponse.json(
        { error: 'No Stripe payment is required for a free order.' },
        { status: 400 }
      );
    }

    // 2. Generate unique IDs
    const orderId = await generateOrderId();
    const trackingId = await generateTrackingId();

    // 3. Create Order in MongoDB
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
        paymentMethod: 'Stripe',
        paymentStatus: 'pending',
      },
      linkedCheckoutLeadId: leadId,
      orderStatus: 'pending_payment',
      fulfillmentStatus: 'pending',
      trackingTimeline: [
        {
          status: 'order_received',
          message: 'Your order has been received.',
          updatedBy: 'system',
        },
      ],
    });

    await sendOrderEmail('new_order', order);

    // 4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: checkoutData.items.map((item) => ({
        price_data: {
          currency: checkoutData.currency.toLowerCase(),
          product_data: {
            name: item.title,
            images: [item.image],
            description: `${item.color} / ${item.size}`,
          },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout`,
      metadata: {
        orderMongoId: order._id.toString(),
        orderId: order.orderId,
        trackingId: order.trackingId,
        leadId: leadId || '',
      },
    });

    // 5. Update Order and Lead with stripeSessionId
    order.payment.stripeSessionId = session.id;
    await order.save();

    if (leadId) {
      const CheckoutLead = (await import('@/models/CheckoutLead')).default;
      await CheckoutLead.findOneAndUpdate(
        { leadId },
        { 
          stripeSessionId: session.id,
          status: 'payment_started',
          linkedOrderId: order.orderId,
          lastActivityAt: new Date()
        }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
