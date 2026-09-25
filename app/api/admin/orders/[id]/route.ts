import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/models/Order';
import { requireAdminApi } from '@/lib/adminAuth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi('/admin/orders');
    if ('error' in auth) return auth.error;
    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Both existing update endpoints share validation, persistence, and notifications.
export { PUT as PATCH } from './status/route';
