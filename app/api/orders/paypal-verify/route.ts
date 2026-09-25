import { sendOrderEmail } from '@/lib/email/sendOrderEmail';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import paypalClient from '@/lib/paypal';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { paypalOrderId, cartItems, customer, shippingAddress } = await req.json();

    // 1. Capture the payment
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});
    const capture = await paypalClient().execute(request);

    if (capture.result.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // 2. Check if order already exists
    const existingOrder = await Order.findOne({ paymentId: paypalOrderId });
    if (existingOrder) {
      return NextResponse.json({ order: existingOrder });
    }

    // 3. Generate Order ID
    const orderId = `8G-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // 4. Create Order
    const newOrder = await Order.create({
      orderId,
      customerInfo: customer,
      shippingAddress,
      items: cartItems,
      totalAmount: capture.result.purchase_units[0].amount.value,
      paymentMethod: 'PayPal',
      paymentStatus: 'paid',
      paymentId: paypalOrderId,
      orderStatus: 'received',
      trackingTimeline: [
        {
          status: 'received',
          message: 'Order successfully placed via PayPal.',
        }
      ]
    });

    await sendOrderEmail('new_order', newOrder);

    // 5. Reduce Stock
    for (const item of cartItems) {
      await Product.updateOne(
        { _id: item.productId, 'variants.sku': item.variantId },
        { $inc: { 'variants.$.stockQuantity': -item.quantity } }
      );
    }

    return NextResponse.json({ order: newOrder });
  } catch (error: any) {
    console.error('PayPal verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
