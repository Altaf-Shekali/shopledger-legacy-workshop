const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');

function order(items, extra) {
  return Object.assign({ id: 1, coupon: '', items: items }, extra || {});
}

test('invoice resolves HSN slab when gstRate is absent', function () {
  const result = invoice.computeInvoiceFigures(order([
    { name: 'Rice', hsn: '1006', price: 100, qty: 1 }
  ]));
  assert.equal(result.rows[0].gstPercent, 5);
  assert.equal(result.tax, 5);
  assert.equal(result.total, 105);
});

test('invoice applies coupon to subtotal and respects checkout cap', function () {
  const result = invoice.computeInvoiceFigures(order([
    { name: 'Goods', hsn: '0902', price: 2240, qty: 1 }
  ], { coupon: 'SAVE10' }));
  assert.equal(result.discount, 150);
  assert.equal(result.total, 2466.2);
});

test('invoice coupon lookup uses checkout normalization', function () {
  const result = invoice.computeInvoiceFigures(order([
    { name: 'Goods', price: 500, qty: 1 }
  ], { coupon: ' save10 ' }));
  assert.equal(result.discount, 50);
});

test('invoice totals and line GST match checkout pricing', function () {
  const result = invoice.computeInvoiceFigures(order([
    { name: 'Rice', hsn: '1006', price: 100, qty: 1, gstRate: 5 }
  ]));
  assert.equal(result.rows[0].line, 100);
  assert.equal(result.rows[0].lineTax, 5);
  assert.equal(result.total, 105);
});


