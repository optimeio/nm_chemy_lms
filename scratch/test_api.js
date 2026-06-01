// Simple test script for cart and waitlist
const fetch = require('node-fetch');
(async () => {
  try {
    // Get users
    const usersRes = await fetch('http://localhost:5000/api/users');
    const users = await usersRes.json();
    if (!Array.isArray(users) || users.length === 0) {
      console.log('No users found');
      return;
    }
    const user = users[0];
    console.log('Using user id:', user._id);
    // Get products
    const prodRes = await fetch('http://localhost:5000/api/products');
    const products = await prodRes.json();
    if (!Array.isArray(products) || products.length === 0) {
      console.log('No products found');
      return;
    }
    const product = products[0];
    console.log('Using product id:', product._id);
    // Add to cart
    const cartRes = await fetch(`http://localhost:5000/api/users/${user._id}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product._id })
    });
    console.log('Cart response status:', cartRes.status);
    console.log('Cart response:', await cartRes.json());
    // Add to waitlist
    const waitRes = await fetch(`http://localhost:5000/api/users/${user._id}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product._id })
    });
    console.log('Waitlist response status:', waitRes.status);
    console.log('Waitlist response:', await waitRes.json());
  } catch (err) {
    console.error('Error:', err);
  }
})();
