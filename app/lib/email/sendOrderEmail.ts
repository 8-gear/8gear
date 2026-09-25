import 'server-only';
import connectDB from '@/lib/db/mongodb';
import Order, { type IOrder } from '@/models/Order';
import EmailTemplate from '@/models/EmailTemplate';
import { DEFAULT_TEMPLATES, type OrderEmailType } from './templates';
import { renderOrderEmail } from './renderOrderEmail';
import { MICROSOFT_MAILBOX, sendMicrosoftMail } from './microsoftGraph';

export async function getEmailTemplate(type: OrderEmailType) {
  await connectDB();
  // Unique type + insert-only defaults preserve saved edits, including disabled templates.
  try {
    return await EmailTemplate.findOneAndUpdate({ type }, { $setOnInsert: DEFAULT_TEMPLATES.find(t => t.type === type)! }, { upsert: true, new: true, runValidators: true });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return EmailTemplate.findOne({ type }).orFail();
    throw error;
  }
}
export async function sendOrderEmail(type: OrderEmailType, order: IOrder, extraData?: { eventKey: string }): Promise<'sent' | 'skipped' | 'failed'> {
  const key = `${type}:${extraData?.eventKey || 'initial'}`;
  let claimed = false;
  try {
    const template = await getEmailTemplate(type);
    if (!template?.enabled) return 'skipped';
    // A persistent atomic claim protects webhook/verification races and repeated requests.
    // Keep failed/unknown claims: Graph may accept mail before a network timeout.
    const claim = await Order.updateOne({
      _id: order._id,
      emailDeliveries: { $not: { $elemMatch: { key } } },
      ...(type === 'order_confirmation' ? { orderConfirmationEmailSentAt: null } : {}),
    }, { $push: { emailDeliveries: { key, type, state: 'claimed', claimedAt: new Date() } } }, { timestamps: false });
    if (claim.modifiedCount !== 1) return 'skipped';
    claimed = true;
    // Re-read just before transport so disabled settings cannot be bypassed by a caller.
    const current = await EmailTemplate.findOne({ type });
    if (!current?.enabled) {
      await Order.updateOne({ _id: order._id }, { $pull: { emailDeliveries: { key } } }, { timestamps: false });
      return 'skipped';
    }
    const rendered = renderOrderEmail(current, order, process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '');
    await sendMicrosoftMail({ senderName: '8 GEARS', to: type === 'new_order' ? process.env.ADMIN_EMAIL || MICROSOFT_MAILBOX : order.customerInfo.email, ...rendered });
    await Order.updateOne({ _id: order._id, 'emailDeliveries.key': key }, { $set: {
      'emailDeliveries.$.state': 'sent', 'emailDeliveries.$.sentAt': new Date(),
      ...(type === 'order_confirmation' ? { orderConfirmationEmailSentAt: new Date() } : {}),
    } }, { timestamps: false });
    return 'sent';
  } catch {
    console.error(`[Order email] ${type} failed; order=${String(order._id)}; delivery may be unknown.`);
    if (claimed) {
      try { await Order.updateOne({ _id: order._id, 'emailDeliveries.key': key }, { $set: { 'emailDeliveries.$.state': 'failed' } }, { timestamps: false }); } catch { /* Never fail an order because email logging failed. */ }
    }
    return 'failed';
  }
}
