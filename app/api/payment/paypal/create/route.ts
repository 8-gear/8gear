import { sendOrderEmail } from '@/lib/email/sendOrderEmail';
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import client from '@/lib/paypal';
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
        { error: 'No PayPal payment is required for a free order.' },
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
        paymentMethod: 'PayPal',
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

    // 4. Create PayPal Order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: checkoutData.currency,
            value: checkoutData.totalAmount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: checkoutData.currency,
                value: checkoutData.subtotal.toFixed(2),
              },
              shipping: {
                currency_code: checkoutData.currency,
                value: checkoutData.shippingAmount.toFixed(2),
              },
            },
          },
          items: checkoutData.items.map((item) => ({
            name: item.title,
            sku: item.sku,
            unit_amount: {
              currency_code: checkoutData.currency,
              value: item.unitPrice.toFixed(2),
            },
            quantity: item.quantity.toString(),
          })),
        },
      ],
    });

    const paypalResponse = await client().execute(request);
    const paypalOrderId = paypalResponse.result.id;

    // 5. Update Order and Lead with paypalOrderId
    order.payment.paypalOrderId = paypalOrderId;
    await order.save();

    if (leadId) {
      const CheckoutLead = (await import('@/models/CheckoutLead')).default;
      await CheckoutLead.findOneAndUpdate(
        { leadId },
        { 
          paypalOrderId: paypalOrderId,
          status: 'payment_started',
          linkedOrderId: order.orderId,
          lastActivityAt: new Date()
        }
      );
    }

    return NextResponse.json({ id: paypalOrderId });
  } catch (error: any) {
    console.error('PayPal Create Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
