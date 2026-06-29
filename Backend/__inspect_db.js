const fs = require('fs');
const path = require('path');
const json = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'));
console.log('Top keys:', Object.keys(json));
let prod = null;
for (const name of ['Product', 'product', 'products', 'catalog', 'items', 'data', 'ProductList']) {
  if (Array.isArray(json[name])) {
    prod = json[name];
    console.log('Found product array at key:', name);
    break;
  }
}
if (!prod) {
  console.log('No product array found at top-level.');
  process.exit(0);
}
console.log('Product count:', prod.length);
const sample = prod.slice(0, 5).map(p => ({
  keys: Object.keys(p).sort(),
  name: p.name || p.title || p._id || p.slug || null,
  price: p.price || p.cost || p.amount || null,
  category: p.category || p.categories || null,
  slug: p.slug || null,
}));
console.log('Sample items:', JSON.stringify(sample, null, 2));
const allKeys = new Set();
prod.slice(0, 100).forEach(p => Object.keys(p).forEach(k => allKeys.add(k)));
console.log('Sample keys (first 100 items):', Array.from(allKeys).sort());
const catCounts = {};
prod.forEach(p => {
  const cat = Array.isArray(p.category) ? p.category.join(',') : p.category || p.categories || 'undefined';
  catCounts[cat] = (catCounts[cat] || 0) + 1;
});
console.log('Category sample counts:', JSON.stringify(Object.entries(catCounts).slice(0, 20), null, 2));
