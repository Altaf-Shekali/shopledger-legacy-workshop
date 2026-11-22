const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');

const orders = {
  1001: { id: 1001, coupon: '', subtotal: 610, discount: 0, tax: 66.9, total: 676.9, items: [
    { id: 8, name: 'Assam CTC Masala Chai 250g', sku: 'BEV-001', hsn: '0902', price: 140, qty: 2 },
    { id: 2, name: 'Unpolished Toor Dal 1kg', sku: 'GRN-002', hsn: '0713', price: 165, qty: 2 }
  ] },
  1002: { id: 1002, coupon: 'SAVE10', subtotal: 1020, discount: 102, tax: 45.9, total: 963.9, items: [
    { id: 1, name: 'Indrayani Basmati Rice 5kg', sku: 'GRN-001', hsn: '1006', price: 640, qty: 1 },
    { id: 4, name: 'Cold-Pressed Sunflower Oil 1L', sku: 'OIL-001', hsn: '1512', price: 190, qty: 2 }
  ] },
  1004: { id: 1004, coupon: 'SAVE10', subtotal: 2240, discount: 150, tax: 104.5, total: 2194.5, items: [
    { id: 5, name: 'Cold-Pressed Groundnut Oil 5L', sku: 'OIL-002', hsn: '1508', price: 1120, qty: 2 }
  ] },
  1008: { id: 1008, coupon: '', subtotal: 500, discount: 0, tax: 90, total: 590, items: [
    { id: 8, name: 'Assam CTC Masala Chai 250g', sku: 'BEV-001', hsn: '0902', price: 140, qty: 1 },
    { id: 12, name: 'Kokum Sherbet Concentrate 750ml', sku: 'BEV-003', hsn: '2106', price: 180, qty: 2 }
  ] }
};

test('invoice matches checkout for mixed HSN items and SAVE10 on order 1002', function () {
  const result = invoice.computeInvoiceFigures(orders[1002]);
  assert.equal(result.subtotal, 1020);
  assert.equal(result.discount, 102);
  assert.equal(result.tax, 45.9);
  assert.equal(result.total, 963.9);
});

test('invoice applies the checkout discount cap on order 1004', function () {
  const result = invoice.computeInvoiceFigures(orders[1004]);
  assert.equal(result.discount, 150);
  assert.equal(result.tax, 104.5);
  assert.equal(result.total, 2194.5);
});

test('invoice uses HSN slabs for non-coupon order 1001', function () {
  const result = invoice.computeInvoiceFigures(orders[1001]);
  assert.deepEqual(result.rows.map(function (row) { return row.gstPercent; }), [18, 5]);
  assert.equal(result.tax, 66.9);
  assert.equal(result.total, 676.9);
});

test('invoice preserves the matching all-18-percent order 1008', function () {
  const result = invoice.computeInvoiceFigures(orders[1008]);
  assert.deepEqual(result.rows.map(function (row) { return row.gstPercent; }), [18, 18]);
  assert.equal(result.tax, 90);
  assert.equal(result.total, 590);
});
