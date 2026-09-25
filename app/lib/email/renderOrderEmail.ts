import type { IOrder } from '@/models/Order';
import { EMAIL_LABELS, type EmailTemplateConfig } from './templates';

export type EmailOrder = Pick<IOrder, 'orderId' | 'trackingId' | 'customerInfo' | 'shippingAddress' | 'items' | 'amounts' | 'payment' | 'orderStatus'> & { createdAt: Date | string; shipping?: IOrder['shipping'] };
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}
export function safeHttpUrl(value: string | undefined): string {
  if (!value) return '';
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
export function renderOrderEmail(template: EmailTemplateConfig, order: EmailOrder, siteUrl: string) {
  const publicSiteUrl = safeHttpUrl(siteUrl);
  const logoUrl = publicSiteUrl ? new URL('/logo.png', publicSiteUrl).href : '';
  const brandHeader = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="8 GEARS" width="180" height="94" style="display:block;width:180px;max-width:100%;height:auto;border:0">`
    : '<strong style="font-size:28px">8 GEARS</strong>';
  const money = (value: number) => `${order.amounts.currency} ${value.toFixed(2)}`;
  const address = [order.shippingAddress.address, order.shippingAddress.apartment, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zip, order.shippingAddress.country].filter(Boolean).join(', ');
  const trackingUrl = safeHttpUrl(order.shipping?.trackingUrl);
  const orderUrl = safeHttpUrl(`${siteUrl.replace(/\/$/, '')}/track-order?trackingId=${encodeURIComponent(order.trackingId)}`);
  const values: Record<string, string> = {
    customerName: order.customerInfo.name, customerEmail: order.customerInfo.email, customerPhone: order.customerInfo.phone,
    orderNumber: order.orderId, orderDate: new Date(order.createdAt).toLocaleString('en-GB', { timeZone: 'UTC' }) + ' UTC',
    orderTotal: money(order.amounts.totalAmount), orderStatus: order.orderStatus.replace(/_/g, ' '),
    trackingNumber: order.shipping?.trackingNumber || '', trackingUrl, carrier: order.shipping?.courierName || '',
    shippingAddress: address, paymentMethod: order.payment.paymentMethod, paymentStatus: order.payment.paymentStatus, trackingId: order.trackingId,
  };
  const replace = (text: string) => text.replace(/{{\s*([a-zA-Z]+)\s*}}/g, (_, key: string) => values[key] ?? '');
  const subject = replace(template.subject).replace(/[\r\n]/g, ' ').slice(0, 300);
  // Templates are plain text. Escape the entire interpolated result; no HTML or code is executed.
  const body = escapeHtml(replace(template.body)).replace(/\n/g, '<br>');
  const rows = order.items.map(item => `<tr><td style="padding:12px 0;border-bottom:1px solid #e2e8f0">${safeHttpUrl(item.image) ? `<img src="${escapeHtml(safeHttpUrl(item.image))}" width="56" alt="" style="vertical-align:middle;margin-right:12px">` : ''}<strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.color)} / ${escapeHtml(item.size)} · SKU: ${escapeHtml(item.sku)} · ${escapeHtml(money(item.unitPrice))} each</small></td><td>${item.quantity}</td><td align="right">${escapeHtml(money(item.lineTotal))}</td></tr>`).join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f1f5f9;color:#0f172a;font-family:Arial,sans-serif"><table role="presentation" width="100%"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" style="width:100%;max-width:600px;background:white;border-radius:20px;overflow:hidden"><tr><td style="padding:32px;background:#ffffff;color:#0f172a;border-top:6px solid #ea580c">${brandHeader}<h1 style="font-size:22px">${escapeHtml(EMAIL_LABELS[template.type])}</h1></td></tr><tr><td style="padding:28px;line-height:1.6"><p>${body}</p><p><strong>Order ${escapeHtml(order.orderId)}</strong><br>${escapeHtml(values.orderDate)}<br>Status: ${escapeHtml(values.orderStatus)}</p><p>${escapeHtml(order.customerInfo.name)}<br>${escapeHtml(order.customerInfo.email)}<br>${escapeHtml(order.customerInfo.phone)}</p><table width="100%" style="font-size:14px;border-collapse:collapse"><thead><tr><th align="left">Product</th><th align="left">Qty</th><th align="right">Total</th></tr></thead><tbody>${rows}</tbody></table><p>Subtotal: ${escapeHtml(money(order.amounts.subtotal))}<br>Shipping: ${escapeHtml(money(order.amounts.shippingAmount))}<br><strong>Total: ${escapeHtml(values.orderTotal)}</strong><br>Payment: ${escapeHtml(values.paymentMethod)} (${escapeHtml(values.paymentStatus)})</p><p><strong>Shipping address</strong><br>${escapeHtml(address)}</p><p>Order tracking ID: ${escapeHtml(order.trackingId)}</p>${values.carrier || values.trackingNumber || trackingUrl ? `<p><strong>Tracking details</strong><br>Carrier: ${escapeHtml(values.carrier || 'Not assigned')}<br>Tracking number: ${escapeHtml(values.trackingNumber || 'Not assigned')}${trackingUrl ? `<br><a href="${escapeHtml(trackingUrl)}">Track shipment</a>` : ''}</p>` : ''}${orderUrl ? `<p><a href="${escapeHtml(orderUrl)}" style="display:inline-block;background:#ea580c;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">View order tracking</a></p>` : ''}</td></tr><tr><td style="padding:24px;text-align:center;background:#f8fafc;color:#64748b">8 GEARS · Crafted for the ride.</td></tr></table></td></tr></table></body></html>`;
  return { subject, html };
}
