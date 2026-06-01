// API verification script after fixing waitlist logic
const fetch = require('node-fetch');
(async () => {
  try {
    // Get first user
    const usersRes = await fetch('http://localhost:5000/api/users');
    const users = await usersRes.json();
    if (!Array.isArray(users) || users.length === 0) {
      console.error('No users found');
      return;
    }
    const user = users[0];
    console.log('User ID:', user._id);
    // Get first product
    const productsRes = await fetch('http://localhost:5000/api/products');
    const products = await productsRes.json();
    if (!Array.isArray(products) || products.length === 0) {
      console.error('No products found');
      return;
    }
    const product = products[0];
    console.log('Product ID:', product._id);
    // Add to cart
    const cartRes = await fetch(`http://localhost:5000/api/users/${user._id}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product._id })
    });
    console.log('Cart status:', cartRes.status);
    console.log('Cart response:', await cartRes.json());
    // Add to waitlist
    const waitRes = await fetch(`http://localhost:5000/api/users/${user._id}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product._id })
    });
    console.log('Waitlist status:', waitRes.status);
    console.log('Waitlist response:', await waitRes.json());
  } catch (err) {
    console.error('Error during API test:', err);
  }
})();
