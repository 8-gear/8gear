import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/adminAuth';
import { updateOrder, OrderUpdateError } from '@/lib/orders/updateOrder';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi('/admin/orders');
    if ('error' in auth) return auth.error;
    const { id } = await params;
    return NextResponse.json(await updateOrder(id, await req.json()));
  } catch (error) {
    if (error instanceof OrderUpdateError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    console.error('[Orders] Update failed');
    return NextResponse.json({ error: 'Unable to update order' }, { status: 500 });
  }
}
