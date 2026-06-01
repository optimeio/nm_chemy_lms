// test_cart.js: verify cart and waitlist endpoints
const fetch = require('node-fetch');
(async () => {
  try {
    const usersRes = await fetch('http://localhost:5000/api/users');
    const users = await usersRes.json();
    if (!Array.isArray(users) || users.length === 0) {
      console.log('No users found');
      return;
    }
    const userId = users[0]._id;
    const productsRes = await fetch('http://localhost:5000/api/products');
    const products = await productsRes.json();
    if (!Array.isArray(products) || products.length === 0) {
      console.log('No products found');
      return;
    }
    const productId = products[0]._id;
    // Add to cart
    const cartRes = await fetch(`http://localhost:5000/api/users/${userId}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });
    const cartData = await cartRes.json();
    console.log('Cart response:', JSON.stringify(cartData));
    // Toggle waitlist
    const waitRes = await fetch(`http://localhost:5000/api/users/${userId}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });
    const waitData = await waitRes.json();
    console.log('Waitlist response:', JSON.stringify(waitData));
  } catch (err) {
    console.error('Error:', err);
  }
})();
