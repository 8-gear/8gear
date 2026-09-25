import { sendOrderEmail } from '@/lib/email/sendOrderEmail';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { stripe } from '@/lib/stripe';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { session_id } = await req.json();

    // 1. Verify session with Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not verified' }, { status: 400 });
    }

    // 2. Check if order already exists for this payment
    const existingOrder = await Order.findOne({ paymentId: session.id });
    if (existingOrder) {
      return NextResponse.json({ order: existingOrder });
    }

    // 3. Extract metadata
    const metadata = session.metadata!;
    const items = JSON.parse(metadata.items);

    // 4. Generate unique human-readable Order ID
    const orderId = `8G-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // 5. Create Order
    const newOrder = await Order.create({
      orderId,
      customerInfo: {
        name: metadata.customerName,
        email: session.customer_details?.email || '',
        phone: metadata.customerPhone,
      },
      shippingAddress: metadata.shippingAddress,
      items,
      totalAmount: session.amount_total! / 100,
      paymentMethod: 'Stripe',
      paymentStatus: 'paid',
      paymentId: session.id,
      orderStatus: 'received',
      trackingTimeline: [
        {
          status: 'received',
          message: 'Order successfully placed and payment verified.',
        }
      ]
    });

    await sendOrderEmail('new_order', newOrder);

    // 6. Reduce Stock
    for (const item of items) {
      await Product.updateOne(
        { 
          _id: item.productId, 
          'variants.sku': item.variantId // Assuming variantId is the SKU or we search by color/size
        },
        { 
          $inc: { 'variants.$.stockQuantity': -item.quantity } 
        }
      );
    }

    return NextResponse.json({ order: newOrder });
  } catch (error: any) {
    console.error('Order verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
