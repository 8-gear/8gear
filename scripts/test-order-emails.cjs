// Isolated service/route regression tests. No database, credentials, or email network calls.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, mocks = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', source)(name => {
    if (name in mocks) return mocks[name];
    if (name === 'server-only') return {};
    return require(name);
  }, module, module.exports);
  return module.exports;
}
const templates = load('app/lib/email/templates.ts');
const renderer = load('app/lib/email/renderOrderEmail.ts', { './templates': templates });
const order = {
  _id: '123456789012345678901234', orderId: '8G-TEST', trackingId: 'TRACK',
  createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01'), emailRevision: 0,
  customerInfo: { name: '<img src=x onerror=alert(1)>', email: 'test@example.com', phone: '123' },
  shippingAddress: { address: 'Test street', city: 'Test', state: 'Test', zip: '123', country: 'Test' },
  items: [{ title: '<script>bad</script>', sku: 'SKU', color: 'Black', size: 'M', image: 'javascript:alert(1)', quantity: 2, unitPrice: 10, lineTotal: 20 }],
  amounts: { currency: 'USD', subtotal: 20, shippingAmount: 0, totalAmount: 20 },
  payment: { paymentMethod: 'Stripe', paymentStatus: 'paid' }, orderStatus: 'processing',
  shipping: { courierName: 'Carrier', trackingNumber: '123', trackingUrl: 'https://example.com/track' },
};
function emailHarness({ enabled = true, fail = false, legacySent = false } = {}) {
  const claims = new Map(); const sent = []; let timestamp;
  const template = { ...templates.DEFAULT_TEMPLATES[0], enabled };
  const model = {
    async updateOne(filter, update) {
      if (update.$push) {
        const delivery = update.$push.emailDeliveries;
        if (claims.has(delivery.key) || (legacySent && 'orderConfirmationEmailSentAt' in filter)) return { modifiedCount: 0 };
        claims.set(delivery.key, delivery); return { modifiedCount: 1 };
      }
      if (update.$pull) claims.delete(update.$pull.emailDeliveries.key);
      if (update.$set) {
        Object.assign(claims.get(filter['emailDeliveries.key']), update.$set);
        timestamp = update.$set.orderConfirmationEmailSentAt;
      }
      return { modifiedCount: 1 };
    },
  };
  const service = load('app/lib/email/sendOrderEmail.ts', {
    '@/lib/db/mongodb': async () => {}, '@/models/Order': model,
    '@/models/EmailTemplate': { findOneAndUpdate: async () => template, findOne: async () => template },
    './templates': templates, './renderOrderEmail': renderer,
    './microsoftGraph': { MICROSOFT_MAILBOX: 'store@example.com', sendMicrosoftMail: async mail => { sent.push(mail); if (fail) throw new Error('provider secret'); } },
  });
  return { service, claims, sent, template, timestamp: () => timestamp };
}
test('all nine templates have valid defaults and reject unsafe/unknown inputs', () => {
  assert.equal(templates.DEFAULT_TEMPLATES.length, 9);
  templates.DEFAULT_TEMPLATES.forEach(t => assert.equal(templates.emailTemplateSchema.safeParse(t).success, true));
  for (const changes of [{ subject: 'bad\r\nBcc: attacker' }, { body: '{{process.env.SECRET}}' }, { body: '{{unknown}}' }, { enabled: 'false' }, { smtpPassword: 'secret' }]) {
    assert.equal(templates.emailTemplateSchema.safeParse({ ...templates.DEFAULT_TEMPLATES[0], ...changes }).success, false);
  }
});
test('render escapes HTML, rejects dangerous links, preserves products and tracking', () => {
  const rendered = renderer.renderOrderEmail({ ...templates.DEFAULT_TEMPLATES[0], body: '{{customerName}} <script>alert(1)</script>' }, order, 'https://store.example');
  assert(!rendered.html.includes('<script>'));
  assert(!rendered.html.includes('<img src=x'));
  assert(!rendered.html.includes('javascript:'));
  for (const text of ['&lt;script&gt;', 'SKU', 'USD 20.00', 'Carrier', 'https://example.com/track', 'Test street']) assert(rendered.html.includes(text));
  assert.equal(renderer.safeHttpUrl('https://user:password@example.com'), '');
});
test('every disabled email type skips transport and claim', async () => {
  const h = emailHarness({ enabled: false });
  for (const type of templates.EMAIL_TYPES) assert.equal(await h.service.sendOrderEmail(type, order), 'skipped');
  assert.equal(h.sent.length, 0); assert.equal(h.claims.size, 0); assert.equal(h.timestamp(), undefined);
});
test('concurrent duplicate confirmation sends claim once and mark success', async () => {
  const h = emailHarness();
  const results = await Promise.all(Array.from({ length: 10 }, () => h.service.sendOrderEmail('order_confirmation', order)));
  assert.equal(results.filter(r => r === 'sent').length, 1); assert.equal(h.sent.length, 1); assert(h.timestamp() instanceof Date);
});
test('legacy sent timestamp prevents sending confirmation again', async () => {
  const h = emailHarness({ legacySent: true });
  assert.equal(await h.service.sendOrderEmail('order_confirmation', order), 'skipped'); assert.equal(h.sent.length, 0);
});
test('admin and customer emails deduplicate independently; new transitions can send', async () => {
  const h = emailHarness();
  await h.service.sendOrderEmail('new_order', order);
  await h.service.sendOrderEmail('order_confirmation', order);
  await h.service.sendOrderEmail('shipped', order, { eventKey: '1' });
  await h.service.sendOrderEmail('shipped', order, { eventKey: '1' });
  await h.service.sendOrderEmail('shipped', order, { eventKey: '2' });
  assert.equal(h.sent.length, 4); assert.equal(h.sent[1].to, order.customerInfo.email);
});
test('transport failure does not escape or retry an ambiguous send', async () => {
  const h = emailHarness({ fail: true }); const log = console.error; const logs = [];
  console.error = (...args) => logs.push(args.join(' '));
  try {
    assert.equal(await h.service.sendOrderEmail('order_confirmation', order), 'failed');
    assert.equal(await h.service.sendOrderEmail('order_confirmation', order), 'skipped');
    assert.equal(h.sent.length, 1); assert.equal(h.timestamp(), undefined);
    assert(!logs.join('').includes('provider secret'));
  } finally { console.error = log; }
});
function updateHarness() {
  let current = structuredClone(order); const sent = []; let updates = 0;
  const model = {
    findById: async () => structuredClone(current),
    findOneAndUpdate: async (filter, update) => {
      if (filter.$or[0].emailRevision !== current.emailRevision) return null;
      updates++;
      for (const [key, value] of Object.entries(update.$set)) {
        if (key.startsWith('shipping.')) current.shipping[key.split('.')[1]] = value; else current[key] = value;
      }
      current.emailRevision++; return structuredClone(current);
    },
  };
  const service = load('app/lib/orders/updateOrder.ts', {
    '@/models/Order': model, '@/lib/email/renderOrderEmail': renderer,
    '@/lib/email/sendOrderEmail': { sendOrderEmail: async (...args) => sent.push(args) },
  });
  return { service, sent, updates: () => updates, archive: () => { current.archived = true; } };
}
test('unchanged status/tracking and notes-only saves do not email', async () => {
  const h = updateHarness();
  await h.service.updateOrder(order._id, { orderStatus: 'processing', courierName: 'Carrier', trackingNumber: '123', trackingUrl: 'https://example.com/track' });
  assert.equal(h.updates(), 0);
  await h.service.updateOrder(order._id, { adminNotes: 'Internal note' });
  assert.equal(h.updates(), 1); assert.equal(h.sent.length, 0);
});
test('all supported status transitions send their corresponding email exactly once', async () => {
  const h = updateHarness();
  for (const status of ['packed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']) {
    await h.service.updateOrder(order._id, { orderStatus: status });
    await h.service.updateOrder(order._id, { orderStatus: status });
  }
  assert.deepEqual(h.sent.map(args => args[0]), ['packed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']);
});
test('tracking save is one event; shipped snapshot includes new tracking', async () => {
  const h = updateHarness();
  await h.service.updateOrder(order._id, { orderStatus: 'shipped', courierName: 'New Carrier', trackingNumber: '456', trackingUrl: 'https://example.com/456' });
  assert.deepEqual(h.sent.map(args => args[0]), ['shipped', 'tracking_update']);
  assert.equal(h.sent[0][1].shipping.trackingNumber, '456');
  await h.service.updateOrder(order._id, { 'shipping.trackingNumber': '456' });
  assert.equal(h.sent.length, 2);
});
test('concurrent status saves generate a single transition and email', async () => {
  const h = updateHarness();
  const results = await Promise.allSettled([h.service.updateOrder(order._id, { orderStatus: 'shipped' }), h.service.updateOrder(order._id, { orderStatus: 'shipped' })]);
  assert.equal(h.sent.length, 1); assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.status, 409);
});
test('order updates reject invalid statuses, URL schemes, arbitrary fields and archived orders', async () => {
  const h = updateHarness();
  for (const update of [{ orderStatus: 'bad' }, { trackingUrl: 'javascript:alert(1)' }, { payment: { paymentStatus: 'paid' } }, { $set: { archived: false } }]) {
    await assert.rejects(() => h.service.updateOrder(order._id, update), e => e.status === 400);
  }
  h.archive();
  await assert.rejects(() => h.service.updateOrder(order._id, { orderStatus: 'shipped' }), e => e.status === 409);
  assert.equal(h.sent.length, 0);
});
test('email management and both update routes enforce existing admin authentication', async () => {
  const denied = Response.json({ error: 'Unauthorized' }, { status: 401 });
  const mocks = { 'next/server': { NextResponse: Response }, '@/lib/adminAuth': { requireAdminApi: async () => ({ error: denied }) } };
  const emails = load('app/api/admin/emails/route.ts', { ...mocks, '@/models/EmailTemplate': {}, '@/lib/email/templates': templates, '@/lib/email/sendOrderEmail': {} });
  assert.equal((await emails.GET()).status, 401);
  assert.equal((await emails.PUT(new Request('https://example.com', { method: 'PUT' }))).status, 401);
  const status = load('app/api/admin/orders/[id]/status/route.ts', { ...mocks, '@/lib/orders/updateOrder': updateHarness().service });
  assert.equal((await status.PUT({}, { params: Promise.resolve({ id: order._id }) })).status, 401);
  const detail = load('app/api/admin/orders/[id]/route.ts', { ...mocks, '@/lib/db/mongodb': {}, '@/models/Order': {}, './status/route': status });
  assert.equal(detail.PATCH, status.PUT);
});
test('template disabled between claim and transport is not sent', async () => {
  let sends = 0;
  const originalRender = renderer.renderOrderEmail;
  // The second settings read occurs after the atomic claim.
  const service = load('app/lib/email/sendOrderEmail.ts', {
    '@/lib/db/mongodb': async () => {},
    '@/models/Order': { updateOne: async () => ({ modifiedCount: 1 }) },
    '@/models/EmailTemplate': {
      findOneAndUpdate: async () => ({ ...templates.DEFAULT_TEMPLATES[0], enabled: true }),
      findOne: async () => ({ ...templates.DEFAULT_TEMPLATES[0], enabled: false }),
    },
    './templates': templates, './renderOrderEmail': { renderOrderEmail: originalRender },
    './microsoftGraph': { sendMicrosoftMail: async () => { sends++; } },
  });
  assert.equal(await service.sendOrderEmail('new_order', order), 'skipped');
  assert.equal(sends, 0);
});
