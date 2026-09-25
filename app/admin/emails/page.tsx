'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { EMAIL_LABELS, TEMPLATE_VARIABLES, type EmailTemplateConfig } from '@/lib/email/templates';
import { renderOrderEmail, type EmailOrder } from '@/lib/email/renderOrderEmail';

const sample: EmailOrder = {
  orderId: '8G-PREVIEW', trackingId: '8G-TRACK-PREVIEW', createdAt: '2026-01-15T12:00:00Z',
  customerInfo: { name: 'Alex Rider', email: 'alex@example.com', phone: '+1 555 0100' },
  shippingAddress: { address: '123 Example Street', city: 'Austin', state: 'TX', zip: '78701', country: 'United States' },
  items: [{ productId: '' as unknown as EmailOrder['items'][number]['productId'], variantId: 'sample', sku: '8G-JACKET-M', title: 'Riding Jacket', slug: 'riding-jacket', color: 'Black', size: 'M', unitPrice: 120, quantity: 2, lineTotal: 240, image: '' }],
  amounts: { subtotal: 240, shippingAmount: 10, totalAmount: 250, currency: 'USD' },
  payment: { paymentMethod: 'Stripe', paymentStatus: 'paid' }, orderStatus: 'shipped',
  shipping: { courierName: 'Example Carrier', trackingNumber: 'TRACK123456', trackingUrl: 'https://example.com/tracking' },
};
export default function EmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplateConfig[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const [previewSiteUrl, setPreviewSiteUrl] = useState('');
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  useEffect(() => {
    let active = true;
    setPreviewSiteUrl(window.location.origin);
    fetch('/api/admin/emails').then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load templates');
      if (active) setTemplates(data);
    }).catch(error => { if (active) setMessage(error instanceof Error ? error.message : 'Unable to load templates'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const current = templates[selected];
  const edit = (change: Partial<EmailTemplateConfig>) => {
    setTemplates(items => items.map((item, index) => index === selected ? { ...item, ...change } : item));
    setDirty(previous => new Set(previous).add(current.type));
    setMessage('');
  };
  const save = async () => {
    setSaving(true); setMessage('');
    try {
      const res = await fetch('/api/admin/emails', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(current) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to save template');
      setTemplates(items => items.map(item => item.type === data.type ? data : item));
      setDirty(previous => { const next = new Set(previous); next.delete(current.type); return next; });
      setMessage('Template saved.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save template'); }
    finally { setSaving(false); }
  };
  const rendered = current ? renderOrderEmail(current, { ...sample, orderStatus: ['new_order', 'order_confirmation', 'tracking_update'].includes(current.type) ? sample.orderStatus : current.type as EmailOrder['orderStatus'] }, previewSiteUrl) : null;
  return <AdminLayout><div className="space-y-6">
    <header><h1 className="text-4xl font-black tracking-tighter text-slate-900">Email Templates</h1><p className="mt-2 text-slate-500">Manage order notifications and customer updates.</p></header>
    {message && <p role="status" className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-700">{message}</p>}
    {loading ? <p>Loading templates…</p> : current && <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
      <nav aria-label="Email templates" className="space-y-2">{templates.map((template, index) => <button key={template.type} disabled={saving} onClick={() => { setSelected(index); setMessage(''); }} className={`w-full rounded-2xl border p-4 text-left ${selected === index ? 'border-orange-600 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'}`}><span className="block font-bold">{EMAIL_LABELS[template.type]}{dirty.has(template.type) ? ' *' : ''}</span><span className={`text-xs font-bold ${template.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>{template.enabled ? 'Enabled' : 'Disabled'}{dirty.has(template.type) ? ' · Unsaved' : ''}</span></button>)}</nav>
      <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-black">{EMAIL_LABELS[current.type]}</h2>
        <p className="text-sm text-slate-500">Recipient: {current.type === 'new_order' ? 'Configured admin/store email' : 'Customer'}</p>
        <fieldset disabled={saving} className="space-y-5">
          <label className="flex items-center gap-3 font-bold"><input type="checkbox" checked={current.enabled} onChange={e => edit({ enabled: e.target.checked })} className="h-5 w-5 accent-orange-600" />{current.enabled ? 'Enabled' : 'Disabled'}</label>
          <label className="block font-bold">Subject<input maxLength={200} value={current.subject} onChange={e => edit({ subject: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal focus:outline-orange-500" /></label>
          <label className="block font-bold">Email body<textarea rows={9} maxLength={20000} value={current.body} onChange={e => edit({ body: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-mono text-sm font-normal focus:outline-orange-500" /></label>
          <p className="text-sm text-slate-500">Use plain text and the variables below. The branded layout automatically includes products, totals, payment, address, and available tracking details.</p>
          <div className="flex flex-wrap gap-2">{TEMPLATE_VARIABLES.map(variable => <code className="rounded bg-slate-100 p-1 text-xs" key={variable}>{`{{${variable}}}`}</code>)}</div>
          <div className="flex gap-3"><button onClick={() => setPreview(!preview)} className="rounded-xl border border-slate-200 px-5 py-3 font-bold">{preview ? 'Hide preview' : 'Preview'}</button><button onClick={save} className="rounded-xl bg-orange-600 px-6 py-3 font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button></div>
        </fieldset>
        {preview && rendered && <div className="space-y-3"><p className="font-bold">Sample subject: {rendered.subject}</p><iframe title="Email preview with sample order" sandbox="" srcDoc={rendered.html} className="h-[750px] w-full rounded-xl border border-slate-200" /></div>}
      </section>
    </div>}
  </div></AdminLayout>;
}
