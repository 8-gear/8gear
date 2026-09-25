import { z } from 'zod';

export const EMAIL_TYPES = ['new_order', 'order_confirmation', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'tracking_update'] as const;
export type OrderEmailType = (typeof EMAIL_TYPES)[number];
export const EMAIL_LABELS: Record<OrderEmailType, string> = {
  new_order: 'New Order', order_confirmation: 'Order Confirmation', processing: 'Processing',
  packed: 'Packed', shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
  cancelled: 'Cancelled', tracking_update: 'Tracking Update',
};
export const TEMPLATE_VARIABLES = ['customerName', 'customerEmail', 'customerPhone', 'orderNumber', 'orderDate', 'orderTotal', 'orderStatus', 'trackingNumber', 'trackingUrl', 'carrier', 'shippingAddress', 'paymentMethod', 'paymentStatus', 'trackingId'] as const;
export interface EmailTemplateConfig { type: OrderEmailType; enabled: boolean; subject: string; body: string }
const messages: Record<OrderEmailType, string> = {
  new_order: 'A new order {{orderNumber}} was placed by {{customerName}}.\nPayment: {{paymentMethod}} ({{paymentStatus}}).',
  order_confirmation: 'Hi {{customerName}},\nThank you for your order! We have confirmed order {{orderNumber}}.',
  processing: 'Hi {{customerName}},\nWe are preparing your order {{orderNumber}}.',
  packed: 'Hi {{customerName}},\nYour order {{orderNumber}} is packed and ready for dispatch.',
  shipped: 'Hi {{customerName}},\nYour order {{orderNumber}} has shipped. Tracking details, when available, are below.',
  out_for_delivery: 'Hi {{customerName}},\nYour order {{orderNumber}} is out for delivery.',
  delivered: 'Hi {{customerName}},\nYour order {{orderNumber}} has been delivered. Thank you for choosing 8 GEARS!',
  cancelled: 'Hi {{customerName}},\nYour order {{orderNumber}} has been cancelled. Contact us if you need help.',
  tracking_update: 'Hi {{customerName}},\nThe tracking details for order {{orderNumber}} have been updated.',
};
export const DEFAULT_TEMPLATES: EmailTemplateConfig[] = EMAIL_TYPES.map(type => ({
  type, enabled: true, subject: `8 GEARS | ${EMAIL_LABELS[type]} — {{orderNumber}}`, body: messages[type],
}));
function validVariables(value: string) {
  const withoutPlaceholders = value.replace(/{{\s*([a-zA-Z]+)\s*}}/g, (match, name: string) =>
    TEMPLATE_VARIABLES.includes(name as typeof TEMPLATE_VARIABLES[number]) ? '' : match);
  return !withoutPlaceholders.includes('{{') && !withoutPlaceholders.includes('}}');
}
export const emailTemplateSchema = z.object({
  type: z.enum(EMAIL_TYPES), enabled: z.boolean(),
  subject: z.string().trim().min(1).max(200).refine(v => !/[\r\n]/.test(v), 'Subject must be one line').refine(validVariables, 'Unknown template variable'),
  body: z.string().trim().min(1).max(20000).refine(validVariables, 'Unknown template variable'),
}).strict();

export const emailToggleSchema = z.object({
  type: z.enum(EMAIL_TYPES), enabled: z.boolean(),
}).strict();
