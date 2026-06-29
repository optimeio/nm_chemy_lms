const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
const outPath = path.join(__dirname, 'products_normalized.json');

function slugify(s) {
  if (!s) return null;
  return s.toString().toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parsePrice(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  const s = String(v).replace(/[^0-9.\-]/g, '');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function normalizeCategory(value) {
  if (Array.isArray(value)) {
    return value.map(String).map(v => v.trim()).filter(Boolean);
  }
  if (value == null) return [];
  return [String(value).trim()].filter(Boolean);
}

function loadRawProducts() {
  const raw = fs.readFileSync(dbPath, 'utf8');
  const db = JSON.parse(raw);
  for (const key of ['Product', 'product', 'products', 'catalog', 'items', 'data', 'ProductList']) {
    if (Array.isArray(db[key])) {
      return db[key];
    }
  }
  return [];
}

function normalizeProduct(p) {
  if (!p || typeof p !== 'object') return null;

  const name = p.name || p.title || null;
  const rawPrice = p.price || p.cost || p.amount || null;
  const price = rawPrice == null ? null : String(rawPrice).trim();
  const images = Array.isArray(p.images) ? p.images : (p.images ? [String(p.images)] : []);
  const category = normalizeCategory(p.category || p.categories);
  const skuSource = p.sku || p.SKU || p.skuCode || p.SKUCode || p.productCode || p.code || p._id || null;
  const sku = skuSource ? String(skuSource).trim() : null;
  const createdAt = p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString();

  if (!name || !price) {
    return null;
  }

  return {
    sku,
    slug: p.slug || slugify(name) || null,
    name: String(name).trim(),
    price,
    category,
    images,
    icon: p.icon || null,
    isNewArrival: !!p.isNewArrival,
    createdAt,
    rawPrice: rawPrice == null ? null : String(rawPrice)
  };
}

function normalizeProducts() {
  const products = loadRawProducts();
  return products
    .map(normalizeProduct)
    .filter(Boolean);
}

if (require.main === module) {
  const normalized = normalizeProducts();
  fs.writeFileSync(outPath, JSON.stringify({ count: normalized.length, products: normalized }, null, 2));
  console.log('Wrote', outPath, 'products:', normalized.length);

  const catCounts = {};
  normalized.forEach(p => {
    const key = p.category.length ? p.category.join(',') : 'undefined';
    catCounts[key] = (catCounts[key] || 0) + 1;
  });
  console.log('Category sample:', JSON.stringify(Object.entries(catCounts).slice(0, 50), null, 2));
}

module.exports = {
  normalizeProducts,
  loadRawProducts,
  normalizeProduct
};
