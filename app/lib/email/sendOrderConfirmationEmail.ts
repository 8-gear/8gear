import type { IOrder } from '@/models/Order';
import { sendOrderEmail } from './sendOrderEmail';

// Preserve the existing payment integration; all mail now honors managed templates.
export async function sendOrderConfirmationEmail(order: IOrder): Promise<void> {
  await sendOrderEmail('order_confirmation', order);
}
