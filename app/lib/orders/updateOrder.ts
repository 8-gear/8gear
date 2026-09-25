import 'server-only';
import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import Order, { type IOrder } from '@/models/Order';
import { sendOrderEmail } from '@/lib/email/sendOrderEmail';
import { type OrderEmailType } from '@/lib/email/templates';
import { safeHttpUrl } from '@/lib/email/renderOrderEmail';

export const orderUpdateSchema = z.object({
  orderStatus: z.enum(['pending_payment', 'order_received', 'payment_confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded']).optional(),
  fulfillmentStatus: z.enum(['pending', 'packed', 'shipped', 'delivered', 'returned']).optional(),
  courierName: z.string().trim().max(120).optional(),
  trackingNumber: z.string().trim().max(200).optional(),
  trackingUrl: z.string().trim().max(2000).refine(v => v === '' || !!safeHttpUrl(v), 'Tracking URL must be an HTTP(S) URL without credentials').optional(),
  adminNotes: z.string().max(10000).optional(),
  timelineMessage: z.string().trim().max(1000).optional(),
}).strict();
export class OrderUpdateError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
const statusEmails: Partial<Record<IOrder['orderStatus'], OrderEmailType>> = {
  processing: 'processing', packed: 'packed', shipped: 'shipped', out_for_delivery: 'out_for_delivery', delivered: 'delivered', cancelled: 'cancelled',
};
export async function updateOrder(id: string, input: unknown) {
  if (!isValidObjectId(id)) throw new OrderUpdateError('Invalid order ID', 400);
  // Support the existing PATCH field names without permitting arbitrary database updates.
  let normalized = input;
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const value = { ...input } as Record<string, unknown>;
    for (const field of ['courierName', 'trackingNumber', 'trackingUrl']) {
      if (`shipping.${field}` in value) {
        if (field in value) throw new OrderUpdateError('Duplicate tracking field', 400);
        value[field] = value[`shipping.${field}`];
        delete value[`shipping.${field}`];
      }
    }
    normalized = value;
  }
  const parsed = orderUpdateSchema.safeParse(normalized);
  if (!parsed.success) throw new OrderUpdateError(parsed.error.issues[0]?.message || 'Invalid update', 400);
  const data = parsed.data;
  const before = await Order.findById(id) as IOrder | null;
  if (!before) throw new OrderUpdateError('Order not found', 404);
  if (before.archived) throw new OrderUpdateError('Archived orders are read-only. Restore this order before editing it.', 409);
  const statusChanged = data.orderStatus !== undefined && data.orderStatus !== before.orderStatus;
  const changes: Record<string, string> = {};
  for (const field of ['orderStatus', 'fulfillmentStatus', 'adminNotes'] as const) {
    if (data[field] !== undefined && data[field] !== before[field]) changes[field] = data[field];
  }
  let trackingChanged = false;
  for (const field of ['courierName', 'trackingNumber', 'trackingUrl'] as const) {
    if (data[field] !== undefined && data[field] !== (before.shipping?.[field] || '')) {
      changes[`shipping.${field}`] = data[field];
      trackingChanged = true;
    }
  }
  if (!Object.keys(changes).length) return before;
  // Compare-and-set prevents concurrent saves from generating duplicate transition events.
  const updated = await Order.findOneAndUpdate({ _id: id, archived: { $ne: true }, updatedAt: before.updatedAt, $or: [{ emailRevision: before.emailRevision || 0 }, ...(before.emailRevision ? [] : [{ emailRevision: { $exists: false } }])] }, {
    $set: changes,
    $inc: { emailRevision: 1 },
    ...(statusChanged ? { $push: { trackingTimeline: { status: data.orderStatus, message: data.timelineMessage || `Order status updated to ${data.orderStatus!.replace(/_/g, ' ')}.`, timestamp: new Date(), updatedBy: 'admin' } } } : {}),
  }, { new: true, runValidators: true }) as IOrder | null;
  if (!updated) throw new OrderUpdateError('Order changed while saving. Refresh and try again.', 409);
  const eventKey = String(updated.emailRevision);
  const type = statusChanged ? statusEmails[updated.orderStatus] : undefined;
  await Promise.all([
    ...(type ? [sendOrderEmail(type, updated, { eventKey })] : []),
    ...(trackingChanged ? [sendOrderEmail('tracking_update', updated, { eventKey })] : []),
  ]);
  return updated;
}
