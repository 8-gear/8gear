const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, dependencies = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports, require: name => dependencies[name], URL });
  return exports;
}
const links = load('app/lib/categoryLinks.ts');
const fleece = { _id: '123', name: 'Fleece', slug: 'fleece', save: async () => {} };
let productCategory = 'Fleece';
const api = load('app/api/admin/categories/route.ts', {
  'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
  '@/lib/db/mongodb': { default: async () => {} },
  '@/lib/adminAuth': { requireAdminApi: async () => ({}) },
  '@/models/Category': { default: { create: async body => body, findById: () => ({ session: async () => fleece }), exists: () => ({ session: async () => null }) } },
  '@/models/Product': { default: { updateMany: async (filter, update) => { if (productCategory === filter.category) productCategory = update.$set.category; } } },
  mongoose: { default: { isObjectIdOrHexString: () => true, connection: { transaction: fn => fn({}) } } },
});
(async () => {
  const created = await api.POST({ json: async () => ({ name: 'New Category', description: '' }) });
  assert.equal(created.status, 201);
  assert.equal(created.body.slug, undefined);
  const originalLink = links.categoryUrl(fleece._id, true);
  assert.equal(originalLink, '/category?categoryId=123#category-listing');
  const response = await api.PATCH({ json: async () => ({ id: '123', name: 'Fleece Cargo', description: '' }) });
  assert.equal(response.status, 200);
  assert.equal(productCategory, 'Fleece Cargo');
  assert.equal(links.categoryUrl(fleece._id, true), originalLink);
  assert.equal(links.resolveCategory([fleece], '123').name, 'Fleece Cargo');
  assert.equal(links.resolveCategory([fleece], null, null, 'fleece')._id, '123');
  assert.equal(links.resolveCategory([fleece], 'missing', 'fleece'), undefined);
  assert.equal(links.resolveCategory([fleece], null, null, 'missing'), undefined);
  assert.equal(links.resolveCategory([fleece], null, 'fleece')._id, '123');
  assert.equal(links.resolveCategory([fleece], '123').name, 'Fleece Cargo');
  console.log('Category creation without slug, ID rename flow, product rename, and legacy link checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
