import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { requireAdminApi } from '@/lib/adminAuth';
import Order from '@/models/Order';
import { sendOrderEmail } from '@/lib/email/sendOrderEmail';

// Legacy entry point: use a persisted order, managed templates, and the same deduplication claims.
export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi('/admin/orders');
    if ('error' in auth) return auth.error;
    const body = await req.json();
    if (typeof body?.orderId !== 'string' || !isValidObjectId(body.orderId)) return NextResponse.json({ error: 'A persisted order ID is required' }, { status: 400 });
    const order = await Order.findById(body.orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    const results = await Promise.all([
      sendOrderEmail('new_order', order),
      ...(order.payment.paymentStatus === 'paid' ? [sendOrderEmail('order_confirmation', order)] : []),
    ]);
    return NextResponse.json({ success: !results.includes('failed'), results });
  } catch {
    return NextResponse.json({ error: 'Unable to send order email' }, { status: 500 });
  }
}
