import { useState, useEffect, useRef } from 'react'
import './index.css'
import AdminDashboard from './AdminDashboard'

const API_URL = 'http://localhost:5000/api';

const DEFAULT_BANNERS = [
  { _id: 'default-1', image: '/hero-image.png', caption: 'Premium Sustainable Engineering Solutions' },
  { _id: 'default-2', image: '/hero-banner.png', caption: 'Precision Agro, Food & Poultry Machineries' },
  { _id: 'default-3', image: '/rocket-stove.png', caption: 'Eco-Friendly High Efficiency Rocket Stoves' }
];

function App() {
  // State
  const [activeSection, setActiveSection] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductImageIndex, setSelectedProductImageIndex] = useState(0);
  const [selectedProductReviews, setSelectedProductReviews] = useState([]);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [entryName, setEntryName] = useState("");
  const [entryWhatsapp, setEntryWhatsapp] = useState("");
  const [entryLocation, setEntryLocation] = useState("");
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [isEntrySubmitted, setIsEntrySubmitted] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [offerData, setOfferData] = useState({
    title: 'Special Offer! 🎉',
    description: 'Get 20% off your first purchase.',
    code: 'SRITECH20',
    poster: null
  });
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [supportQueries, setSupportQueries] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const displayBanners = heroBanners && heroBanners.length > 0 ? heroBanners : DEFAULT_BANNERS;
  const [complaintForm, setComplaintForm] = useState({
    customerName: '',
    email: '',
    subject: '',
    message: ''
  });

  // User Auth State
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', or 'verify-otp'
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userCredentials, setUserCredentials] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [otpCode, setOtpCode] = useState('');
  const [activeUser, setActiveUser] = useState(null);
  const [authPortalIsGate, setAuthPortalIsGate] = useState(false); // true = portal is mandatory gate on /

  // Suggestions search state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Click outside suggestions dropdown detector
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % displayBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [displayBanners.length]);

  // Show a toast notification
  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync cart & waitlist from DB when user logs in
  useEffect(() => {
    if (activeUser) {
      setCart(activeUser.cart || []);
      setWaitlist(activeUser.waitlist || []);
    } else {
      setCart([]);
      setWaitlist([]);
    }
  }, [activeUser]);

  useEffect(() => {
    if (activeUser) {
      setComplaintForm(prev => ({
        ...prev,
        customerName: activeUser.name || '',
        email: activeUser.email || ''
      }));
    } else {
      setComplaintForm({
        customerName: '',
        email: '',
        subject: '',
        message: ''
      });
    }
  }, [activeUser]);

  // Scroll Spy for Navigation
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'product', 'new-arrival'];
      let current = 'home';
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 250) {
            current = section;
          }
        }
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // URL Path Detection for Admin
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (showEntryModal) setShowEntryModal(false);
        if (showOfferModal) setShowOfferModal(false);
        if (showAdminLogin) setShowAdminLogin(false);
        if (showAuthModal) setShowAuthModal(false);
        if (showComplaintModal) setShowComplaintModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showEntryModal, showOfferModal, showAdminLogin, showAuthModal, showComplaintModal]);

  // Initial Popup and Data Fetching
  // Fetch Initial Data
  const fetchData = async () => {
    const t = Date.now();

    // Fetch products
    try {
      const prodRes = await fetch(`${API_URL}/products?t=${t}`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      // Fetch categories
      try {
        const catRes = await fetch(`${API_URL}/categories?t=${t}`);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData); // store full objects with _id, name, slug
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }

    // Fetch offers
    try {
      const offerRes = await fetch(`${API_URL}/offers?t=${t}`);
      if (offerRes.ok) {
        const offerData = await offerRes.json();
        setOfferData(offerData);
      }
    } catch (err) {
      console.error("Error fetching offers:", err);
    }

    // Fetch orders
    try {
      const orderRes = await fetch(`${API_URL}/orders?t=${t}`);
      if (orderRes.ok) {
        setOrders(await orderRes.json());
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }

    // Fetch coupons
    try {
      const couponRes = await fetch(`${API_URL}/coupons?t=${t}`);
      if (couponRes.ok) {
        setCoupons(await couponRes.json());
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
    }

    // Fetch support queries
    try {
      const supportRes = await fetch(`${API_URL}/support?t=${t}`);
      if (supportRes.ok) {
        setSupportQueries(await supportRes.json());
      }
    } catch (err) {
      console.error("Error fetching support queries:", err);
    }

    // Fetch activity logs
    try {
      const logRes = await fetch(`${API_URL}/logs?t=${t}`);
      if (logRes.ok) {
        setActivityLogs(await logRes.json());
      }
    } catch (err) {
      console.error("Error fetching activity logs:", err);
    }

    // Fetch visitor leads
    try {
      const leadsRes = await fetch(`${API_URL}/leads?t=${t}`);
      if (leadsRes.ok) {
        setLeads(await leadsRes.json());
      }
    } catch (err) {
      console.error("Error fetching visitor leads:", err);
    }

    // Fetch registered users
    try {
      const usersRes = await fetch(`${API_URL}/users?t=${t}`);
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }

    // Fetch hero banners
    try {
      const heroRes = await fetch(`${API_URL}/hero-banners?t=${t}`);
      if (heroRes.ok) {
        setHeroBanners(await heroRes.json());
      }
    } catch (err) {
      console.error("Error fetching hero banners:", err);
    }
  };

  useEffect(() => {
    const isAdminPath = window.location.pathname === '/admin' || window.location.pathname === '/admin/';

    if (isAdminPath) {
      setShowAdminLogin(true);
    } else {
      // Show user login portal immediately as a gate on the main site
      setShowAuthModal(true);
      setAuthPortalIsGate(true);
    }

    fetchData();
  }, []);

  // Fetch reviews when product is selected
  useEffect(() => {
    if (selectedProduct) {
      const fetchReviews = async () => {
        try {
          const res = await fetch(`${API_URL}/products/${selectedProduct._id || selectedProduct.id}/reviews?t=${Date.now()}`);
          if (res.ok) {
            setSelectedProductReviews(await res.json());
          }
        } catch (err) {
          console.error("Error fetching reviews:", err);
        }
      };
      fetchReviews();
    } else {
      setSelectedProductReviews([]);
    }
  }, [selectedProduct]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    if (selectedProduct) {
      try {
        const res = await fetch(`${API_URL}/products/${selectedProduct._id || selectedProduct.id}/reviews?t=${Date.now()}`);
        if (res.ok) {
          setSelectedProductReviews(await res.json());
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isUserLoggedIn) {
      showToast("Please login to leave a review.", 'error');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/products/${selectedProduct._id || selectedProduct.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: activeUser.name,
          rating: newReviewRating,
          comment: newReviewComment
        })
      });
      if (res.ok) {
        const savedReview = await res.json();
        setSelectedProductReviews([savedReview, ...selectedProductReviews]);
        setNewReviewComment("");
        setNewReviewRating(5);
        showToast("🎉 Thank you! Your review has been submitted successfully.", 'success');
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to submit review.", 'error');
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      showToast("Error connecting to server.", 'error');
    }
  };

  const addHeroBanner = async (newBanner) => {
    try {
      const res = await fetch(`${API_URL}/hero-banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner)
      });
      if (res.ok) {
        const saved = await res.json();
        setHeroBanners(prev => [...prev, saved]);
        showToast('Hero banner uploaded successfully!', 'success');
        const logRes = await fetch(`${API_URL}/logs`);
        if (logRes.ok) setActivityLogs(await logRes.json());
      } else {
        showToast('Failed to upload hero banner.', 'error');
      }
    } catch (err) {
      console.error("Error adding hero banner:", err);
      showToast('Error uploading hero banner.', 'error');
    }
  };

  const deleteHeroBanner = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this hero banner?")) return;
    try {
      const res = await fetch(`${API_URL}/hero-banners/${bannerId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setHeroBanners(prev => prev.filter(b => (b._id || b.id) !== bannerId));
        showToast('Hero banner deleted successfully!', 'success');
        const logRes = await fetch(`${API_URL}/logs`);
        if (logRes.ok) setActivityLogs(await logRes.json());
      } else {
        showToast('Failed to delete hero banner.', 'error');
      }
    } catch (err) {
      console.error("Error deleting hero banner:", err);
      showToast('Error deleting hero banner.', 'error');
    }
  };

  // Handlers
  const addProduct = async (newProduct) => {
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      const savedProduct = await res.json();
      setProducts([savedProduct, ...products]);
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => (p._id || p.id) !== productId));
        showToast('Product deleted successfully!', 'success');
        const logRes = await fetch(`${API_URL}/logs`);
        setActivityLogs(await logRes.json());
      } else {
        showToast('Failed to delete product.', 'error');
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const updateProduct = async (productId, updatedData) => {
    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(prev => prev.map(p => (p._id || p.id) === productId ? updated : p));
        showToast('Product updated successfully!', 'success');
        const logRes = await fetch(`${API_URL}/logs`);
        setActivityLogs(await logRes.json());
      } else {
        showToast('Failed to update product.', 'error');
      }
    } catch (err) {
      console.error("Error updating product:", err);
      showToast('Error connecting to server.', 'error');
    }
  };



  const updateOffer = async (newOffer) => {
    try {
      const res = await fetch(`${API_URL}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffer)
      });
      const savedOffer = await res.json();
      setOfferData(savedOffer);
    } catch (err) {
      console.error("Error updating offer:", err);
    }
  };

  

  const addCoupon = async (newCouponData) => {
    try {
      const res = await fetch(`${API_URL}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCouponData)
      });
      if (res.ok) {
        const savedCoupon = await res.json();
        setCoupons(prev => [savedCoupon, ...prev]);
        showToast('Coupon added successfully!', 'success');
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to add coupon.', 'error');
      }
    } catch (err) {
      console.error("Error adding coupon:", err);
      showToast('Connection error.', 'error');
    }
  };

  const deleteCoupon = async (couponId) => {
    if (!window.confirm("Are you sure you want to permanently delete this coupon?")) return;
    try {
      const res = await fetch(`${API_URL}/coupons/${couponId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => (c._id || c.id) !== couponId));
        showToast('Coupon deleted successfully!', 'success');
        const logRes = await fetch(`${API_URL}/logs`);
        setActivityLogs(await logRes.json());
      } else {
        showToast('Failed to delete coupon.', 'error');
      }
    } catch (err) {
      console.error("Error deleting coupon:", err);
    }
  };

  const updateCoupon = async (couponId, updatedCouponData) => {
    try {
      const res = await fetch(`${API_URL}/coupons/${couponId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCouponData)
      });
      if (res.ok) {
        const updatedCoupon = await res.json();
        setCoupons(prev => prev.map(c => (c._id || c.id) === couponId ? updatedCoupon : c));
        showToast('Coupon updated successfully!', 'success');
        const logRes = await fetch(`${API_URL}/logs`);
        setActivityLogs(await logRes.json());
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to update coupon.', 'error');
      }
    } catch (err) {
      console.error("Error updating coupon:", err);
    }
  };

  const handleToggleBlockUser = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/status`, {
        method: 'PATCH',
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(u => u._id === userId ? updatedUser : u));
        const logRes = await fetch(`${API_URL}/logs`);
        setActivityLogs(await logRes.json());
      } else {
        showToast('Failed to change user status.', 'error');
      }
    } catch (err) {
      console.error("Error changing user status:", err);
      showToast('Error changing user status.', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
        const logRes = await fetch(`${API_URL}/logs`);
        setActivityLogs(await logRes.json());
        showToast('User deleted successfully.', 'success');
      } else {
        showToast('Failed to delete user.', 'error');
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      showToast('Error deleting user.', 'error');
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintForm)
      });
      if (res.ok) {
        const savedQuery = await res.json();
        setSupportQueries([savedQuery, ...supportQueries]);
        const logRes = await fetch(`${API_URL}/logs`);
        if (logRes.ok) setActivityLogs(await logRes.json());
        
        showToast('🎉 Support ticket raised successfully! Our team will get back to you shortly.', 'success');
        setShowComplaintModal(false);
        setComplaintForm(prev => ({
          ...prev,
          subject: '',
          message: ''
        }));
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to submit support ticket.', 'error');
      }
    } catch (err) {
      console.error("Support submit error:", err);
      alert('Error connecting to server.');
    }
  };

  const respondToSupport = async (queryId, responseText) => {
    try {
      const res = await fetch(`${API_URL}/support/${queryId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText })
      });
      if (res.ok) {
        const updatedQuery = await res.json();
        setSupportQueries(prev => prev.map(q => (q._id || q.id) === queryId ? updatedQuery : q));
        showToast('Response sent to customer successfully!', 'success');
        const logRes = await fetch(`${API_URL}/logs`);
        if (logRes.ok) setActivityLogs(await logRes.json());
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to send response.', 'error');
      }
    } catch (err) {
      console.error("Error responding to support:", err);
      showToast('Error connecting to server.', 'error');
    }
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const leadData = {
      name: formData.get('userName'),
      whatsapp: formData.get('userWhatsapp'),
      location: formData.get('userLocation')
    };

    try {
      await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      setIsEntrySubmitted(true);
      setTimeout(() => {
        setShowEntryModal(false);
        setTimeout(() => setShowOfferModal(true), 500);
      }, 1000);
    } catch (err) {
      console.error("Error saving lead:", err);
      // Fallback: still show website even if lead saving fails
      setShowEntryModal(false);
      setTimeout(() => setShowOfferModal(true), 500);
    }
  };

  const closeEntryModal = () => {
    setShowEntryModal(false);
    setTimeout(() => setShowOfferModal(true), 500);
  };
  const handleAddToCart = async (product) => {
    if (!isUserLoggedIn) {
      showToast('Please login to add items to cart.', 'error');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    const productId = product._id || product.id;
    try {
      const res = await fetch(`${API_URL}/users/${activeUser._id}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        setCart(prev => [...prev, product]);
        showToast(`✅ ${product.name} added to cart!`, 'success');
      } else {
        showToast('Failed to add to cart.', 'error');
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      showToast('Server error. Please try again.', 'error');
    }
  };

  // Remove product from cart
  const handleRemoveFromCart = async (productId) => {
    if (isUserLoggedIn) {
      try {
        await fetch(`${API_URL}/users/${activeUser._id}/cart/${productId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error("Error removing from cart on backend:", err);
      }
    }
    setCart(prev => prev.filter(p => {
      const idStr = p?._id || p?.id || p;
      return idStr !== productId;
    }));
  };

  // Checkout cart: create order with all cart items and total amount
  const handleCheckoutCart = async () => {
    if (!isUserLoggedIn) {
      showToast('Please login to place an order.', 'error');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    if (resolvedCartItems.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }
    const confirmOrder = window.confirm(`Confirm purchase of ${resolvedCartItems.length} items totaling ₹${cartTotal}?`);
    if (!confirmOrder) return;

    const orderItems = resolvedCartItems.map(p => ({ product: p._id || p.id, quantity: 1, price: getProductFinalPrice(p) }));
    const totalAmount = cartTotal;

    const orderData = {
      customerName: activeUser.name,
      email: activeUser.email,
      items: orderItems,
      totalAmount,
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const order = await res.json();
        
        // Clear backend cart as well
        try {
          await fetch(`${API_URL}/users/${activeUser._id}/cart`, {
            method: 'DELETE'
          });
        } catch (err) {
          console.error("Error clearing cart on backend:", err);
        }

        showToast(`🎉 Success! Order #${order.orderId} placed. Confirmation email sent to ${activeUser.email}`, 'success');
        setCart([]); // clear local cart
        setShowCart(false);
      } else {
        showToast('Failed to place order. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Order error:', err);
      showToast('Error connecting to server.', 'error');
    }
  };

  const handleToggleWaitlist = async (productId) => {
    if (!isUserLoggedIn) {
      showToast('Please login to save to wishlist.', 'error');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users/${activeUser._id}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        const updatedWaitlist = await res.json();
        setWaitlist(updatedWaitlist);
        const isNowInWishlist = updatedWaitlist.includes(productId);
        showToast(isNowInWishlist ? '❤️ Added to wishlist!' : '💔 Removed from wishlist.', 'success');
      } else {
        showToast('Failed to update wishlist.', 'error');
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      showToast('Server error. Please try again.', 'error');
    }
  };

  const handleBuyNow = async (product) => {
    if (!isUserLoggedIn) {
      showToast('Please login or sign up to place an order.', 'error');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    const confirmOrder = window.confirm(`Confirm purchase for ${product.name} at ₹${getProductFinalPrice(product)}?`);
    if (!confirmOrder) return;

    try {
      const orderData = {
        customerName: activeUser.name,
        email: activeUser.email,
        items: [{ product: product._id, quantity: 1, price: product.price }],
        totalAmount: product.price
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const order = await res.json();
        showToast(`🎉 Success! Order #${order.orderId} placed. Confirmation email sent to ${activeUser.email}`, 'success');
      } else {
        showToast('Failed to place order. Please try again.', 'error');
      }
    } catch (err) {
      console.error("Order error:", err);
      showToast('Error connecting to server.', 'error');
    }
  };


  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSearchTerm(""); // Clear search when category changes
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminCredentials.username,
          password: adminCredentials.password
        })
      });

      if (res.ok) {
        setIsAdmin(true);
        setShowAdminLogin(false);
        setAdminCredentials({ username: '', password: '' });
        fetchData();
        showToast('Admin authenticated successfully!', 'success');
      } else {
        const error = await res.json();
        showToast(error.message || 'Invalid admin credentials.', 'error');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      showToast('Unable to login to the admin portal.', 'error');
    }
  };

  const handleUserAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'signup') {
        if (userCredentials.password !== userCredentials.confirmPassword) {
          showToast('Passwords do not match!', 'error');
          return;
        }
        const res = await fetch(`${API_URL}/users/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userCredentials.name, email: userCredentials.email, password: userCredentials.password })
        });
        if (res.ok) {
          setAuthMode('verify-otp');
          showToast('OTP sent to your email. Please verify.', 'success');
        } else {
          const error = await res.json();
          showToast(error.message || 'Signup failed', 'error');
        }
      } else if (authMode === 'verify-otp') {
        const res = await fetch(`${API_URL}/users/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userCredentials.email, otp: otpCode })
        });
        if (res.ok) {
          const data = await res.json();
          setActiveUser(data);
          setIsUserLoggedIn(true);
          setShowAuthModal(false);
          showToast(`Welcome, ${data.name}!`, 'success');
        } else {
          const error = await res.json();
          showToast(error.message || 'OTP verification failed', 'error');
        }
      } else {
        const res = await fetch(`${API_URL}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userCredentials.email, password: userCredentials.password })
        });
        if (res.ok) {
          const data = await res.json();
          setActiveUser(data);
          setIsUserLoggedIn(true);
          setShowAuthModal(false);
          showToast('Logged in successfully!', 'success');
        } else {
          const error = await res.json();
          showToast(error.message || 'Authentication failed', 'error');
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      showToast('Authentication error. Please try again.', 'error');
    }
    if (authMode !== 'signup') {
      setUserCredentials({ name: '', email: '', password: '', confirmPassword: '' });
      setOtpCode('');
    }
  };

  const handleLogout = () => {
    setIsUserLoggedIn(false);
    setActiveUser(null);
    setAuthMode('login');
    setUserCredentials({ name: '', email: '', password: '', confirmPassword: '' });
    setOtpCode('');
    setShowAuthModal(true);
    setAuthPortalIsGate(true);
  };

  if (isAdmin) {
    return (
      <AdminDashboard 
        onLogout={() => {
          setIsAdmin(false);
        }} 
        products={products} 
        onAddProduct={addProduct} 
        onDeleteProduct={deleteProduct}
        onUpdateProduct={updateProduct}

        offerData={offerData}
        onUpdateOffer={updateOffer}
        categories={categories}
        onAddCategory={addCategory}
        onAddCoupon={addCoupon}
        onDeleteCoupon={deleteCoupon}
        onUpdateCoupon={updateCoupon}
        orders={orders}
        coupons={coupons}
        supportQueries={supportQueries}
        activityLogs={activityLogs}
        leads={leads}
        users={users}
        onToggleBlockUser={handleToggleBlockUser}
        onDeleteUser={handleDeleteUser}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        heroBanners={heroBanners}
        onAddHeroBanner={addHeroBanner}
        onDeleteHeroBanner={deleteHeroBanner}
        onRespondToSupport={respondToSupport}
      />

    );
  }


  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    if (typeof priceStr === 'number') return priceStr;
    const cleaned = priceStr.toString().replace(/[₹$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const getProductFinalPrice = (product) => {
    if (!product) return 0;
    const priceNum = parsePrice(product.price);
    const activeCoupon = coupons.find(c => 
      c.isActive && 
      c.linkedProduct === (product._id || product.id) &&
      (!c.expiryDate || new Date(c.expiryDate) > new Date())
    );
    if (activeCoupon) {
      const discountVal = parseFloat(activeCoupon.discountValue) || 0;
      if (activeCoupon.discountType === 'Fixed') {
        return Math.max(0, priceNum - discountVal);
      }
      return Math.round(priceNum * (1 - discountVal / 100));
    }
    return priceNum;
  };

  const resolvedCartItems = cart.map(cartIdOrObj => {
    if (cartIdOrObj && typeof cartIdOrObj === 'object' && cartIdOrObj.name) {
      return cartIdOrObj;
    }
    const idStr = cartIdOrObj?._id || cartIdOrObj?.id || cartIdOrObj;
    return products.find(p => (p._id || p.id) === idStr);
  }).filter(Boolean);

  const cartTotal = resolvedCartItems.reduce((sum, item) => sum + getProductFinalPrice(item), 0);

  const matchedSuggestions = searchTerm.trim() === "" ? [] : products.filter(product => {
    const productCategory = product.category ? product.category.toLowerCase().trim() : '';
    const nameMatch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = productCategory.includes(searchTerm.toLowerCase());
    return nameMatch || categoryMatch;
  });

  const handleSuggestionClick = (product) => {
    setSelectedProduct(product);
    setSelectedProductImageIndex(0);
    setShowSuggestions(false);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      const res = await fetch(`${API_URL}/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: userCredentials.name || 'User', 
          email: userCredentials.email, 
          password: userCredentials.password || 'TemporaryPassword123' 
        })
      });
      if (res.ok) {
        showToast('OTP resent successfully!', 'success');
        setResendTimer(30); // 30 seconds cooldown
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to resend OTP', 'error');
      }
    } catch (err) {
      showToast('Network error, please try again', 'error');
    }
  };

  const filteredProducts = products.filter(product => {
    const productCategory = product.category ? product.category.toLowerCase().trim() : '';
    const selectedCatClean = selectedCategory ? selectedCategory.toLowerCase().trim() : '';
    const productCategorySlug = productCategory.replace(/\s+/g, '-');
    
    const matchesCategory = selectedCatClean === 'all' || 
                            productCategory === selectedCatClean || 
                            productCategorySlug === selectedCatClean;
                            
    const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          productCategory.includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`toast-popup ${toastMessage.type}`}>
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div id="productDetailModal" className="modal-overlay active" style={{ display: 'flex' }}>
          <div className="modal-content detail-modal" role="dialog" aria-modal="true">
            <button className="close-modal" onClick={() => setSelectedProduct(null)} aria-label="Close">&times;</button>
            
            <div className="detail-modal-body">
              {/* Left Column: Image Slider */}
              <div className="product-slider">
                <div className="slider-main-image">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <img 
                      src={selectedProduct.images[selectedProductImageIndex]} 
                      alt={selectedProduct.name} 
                    />
                  ) : (
                    <i className={`fa-solid ${selectedProduct.icon || 'fa-box'} placeholder-img`} style={{ fontSize: '7rem' }} aria-hidden="true"></i>
                  )}
                  
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <>
                      <button 
                        className="slider-arrow prev" 
                        onClick={() => setSelectedProductImageIndex(prev => (prev === 0 ? selectedProduct.images.length - 1 : prev - 1))}
                        aria-label="Previous image"
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                      <button 
                        className="slider-arrow next" 
                        onClick={() => setSelectedProductImageIndex(prev => (prev === selectedProduct.images.length - 1 ? 0 : prev + 1))}
                        aria-label="Next image"
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails indicator */}
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="slider-thumbnails">
                    {selectedProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        className={`thumbnail-btn ${selectedProductImageIndex === idx ? 'active' : ''}`}
                        onClick={() => setSelectedProductImageIndex(idx)}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Details Info */}
              <div className="product-detail-info">
                <span className="category-badge">
                  {((selectedProduct.category || '').toString().includes('-') 
                    ? selectedProduct.category 
                    : (selectedProduct.category || '').toLowerCase().replace(/\s+/g, '-'))
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </span>
                <h2>{selectedProduct.name}</h2>
                <div className="price-tag">
                  {(() => {
                    const priceNum = parsePrice(selectedProduct.price);
                    const activeCoupon = coupons.find(c => 
                      c.isActive && 
                      c.linkedProduct === (selectedProduct._id || selectedProduct.id) &&
                      (!c.expiryDate || new Date(c.expiryDate) > new Date())
                    );
                    if (activeCoupon) {
                      const discountVal = parseFloat(activeCoupon.discountValue) || 0;
                      let discountedPrice;
                      let discountText;
                      if (activeCoupon.discountType === 'Fixed') {
                        discountedPrice = Math.max(0, priceNum - discountVal);
                        discountText = `₹${discountVal} off`;
                      } else {
                        discountedPrice = Math.round(priceNum * (1 - discountVal / 100));
                        discountText = `${discountVal}% off`;
                      }
                      return (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-dark)' }}>₹{discountedPrice.toLocaleString('en-IN')}</span>
                          <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{priceNum.toLocaleString('en-IN')}</span>
                          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#388e3c' }}>{discountText} (Coupon: {activeCoupon.code})</span>
                        </div>
                      );
                    }
                    return selectedProduct.price.toString().startsWith('₹') ? selectedProduct.price : `₹${selectedProduct.price}`;
                  })()}
                </div>
                <p className="description-text">
                  Experience top-tier quality and premium design with our {selectedProduct.name}. Crafted carefully to blend cutting-edge performance with eco-friendly efficiency. Contact support or use our active coupon codes for additional seasonal discounts.
                </p>
                <div className="actions-row">
                  <button className="buy-now-btn" onClick={() => { setSelectedProduct(null); handleBuyNow(selectedProduct); }}>Buy Now</button>
                  <button className="add-to-cart" onClick={() => handleAddToCart(selectedProduct)}>Add to Cart</button>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="reviews-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem', textAlign: 'left' }}>Customer Reviews</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="reviews-layout">
                {/* Reviews List */}
                <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {selectedProductReviews.length > 0 ? (
                    selectedProductReviews.map((rev, index) => (
                      <div key={rev._id || index} className="review-card" style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{rev.customerName}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="review-rating" style={{ color: '#fbbf24', fontSize: '0.9rem' }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i key={i} className={`${i < rev.rating ? 'fa-solid' : 'fa-regular'} fa-star`}></i>
                          ))}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0', lineHeight: '1.4' }}>{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'left' }}>No reviews yet. Be the first to share your thoughts!</p>
                  )}
                </div>

                {/* Submit Review Form (Only for buyers) */}
                <div className="review-form-container" style={{ textAlign: 'left' }}>
                  {isUserLoggedIn && orders.some(order => order.customerName === activeUser.name && order.items.some(item => (item.product._id || item.product) === selectedProduct._id)) ? (
                    <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 style={{ color: 'var(--primary-color)', margin: '0' }}>Share Your Experience</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0' }}>As a verified purchaser, you can rate this product below.</p>
                      
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>Your Rating</label>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '1.5rem', color: '#fbbf24', cursor: 'pointer' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i 
                              key={star} 
                              className={`${star <= newReviewRating ? 'fa-solid' : 'fa-regular'} fa-star`}
                              onClick={() => setNewReviewRating(star)}
                            ></i>
                          ))}
                        </div>
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label htmlFor="reviewComment" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>Your Review</label>
                        <textarea 
                          id="reviewComment"
                          rows="4" 
                          placeholder="What did you think of the product? Share your experience with others..." 
                          required
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
                        ></textarea>
                      </div>

                      <button type="submit" className="buy-now-btn" style={{ width: '100%', padding: '0.75rem' }}>Submit Review</button>
                    </form>
                  ) : (
                    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '200px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      <i className="fa-solid fa-circle-info" style={{ fontSize: '2rem', color: 'var(--primary-light)', marginBottom: '0.75rem' }}></i>
                      <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--primary-color)' }}>Review Option Locked</p>
                      <p style={{ margin: '0', fontSize: '0.85rem' }}>
                        {isUserLoggedIn 
                          ? "Only verified purchasers of this product can submit a review." 
                          : "Please login and purchase this product to write a review."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom: Related Products */}
            <div className="related-products-section">
              <h3>Related Products</h3>
              <div className="related-products-grid">
                {products
                  .filter(p => (p.category || '').toLowerCase().trim().replace(/\s+/g, '-') === (selectedProduct.category || '').toLowerCase().trim().replace(/\s+/g, '-') && ((p._id || p.id) !== (selectedProduct._id || selectedProduct.id)))
                  .slice(0, 4)
                  .map(relatedProduct => (
                    <div 
                      key={relatedProduct._id || relatedProduct.id} 
                      className="related-product-card"
                      onClick={() => {
                        setSelectedProduct(relatedProduct);
                        setSelectedProductImageIndex(0);
                      }}
                    >
                      <div className="related-product-img">
                        {relatedProduct.images && relatedProduct.images.length > 0 ? (
                          <img src={relatedProduct.images[0]} alt={relatedProduct.name} />
                        ) : (
                          <i className={`fa-solid ${relatedProduct.icon || 'fa-box'}`} style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
                        )}
                      </div>
                      <div className="related-product-info">
                        <h4>{relatedProduct.name}</h4>
                        <p>{relatedProduct.price.toString().startsWith('₹') ? relatedProduct.price : `₹${relatedProduct.price}`}</p>
                      </div>
                    </div>
                  ))}
                {products.filter(p => (p.category || '').toLowerCase().trim().replace(/\s+/g, '-') === (selectedProduct.category || '').toLowerCase().trim().replace(/\s+/g, '-') && (p._id !== selectedProduct._id && p.id !== selectedProduct.id)).length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'left', gridColumn: '1 / -1' }}>No related products found in this category.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

       {/* Cart Modal */}
       {showCart && (
         <div id="cartModal" className="modal-overlay active" style={{ display: 'flex' }}>
           <div className="modal-content" role="dialog" aria-modal="true" style={{ maxWidth: '600px', width: '90%' }}>
             <button className="close-modal" onClick={() => setShowCart(false)} aria-label="Close">
               &times;
             </button>
             <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <i className="fa-solid fa-cart-shopping"></i> Shopping Cart
             </h2>
             {resolvedCartItems.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '2rem' }}>
                 <i className="fa-solid fa-cart-flatbed" style={{ fontSize: '3rem', color: 'var(--primary-color)', opacity: 0.2, marginBottom: '1rem', display: 'block' }}></i>
                 <p style={{ color: 'var(--text-muted)' }}>Your cart is empty.</p>
               </div>
             ) : (
               <div>
                 <ul className="modal-item-list">
                   {resolvedCartItems.map((item, idx) => (
                     <li key={idx} className="modal-item-card">
                       <div className="modal-item-img">
                         {item.images && item.images.length > 0 ? (
                           <img src={item.images[0]} alt={item.name} />
                         ) : (
                           <i className={`fa-solid ${item.icon || 'fa-box'}`}></i>
                         )}
                       </div>
                       <div className="modal-item-details">
                         <span className="modal-item-category">{((item.category || '').toString().includes('-') ? item.category : (item.category || '').toLowerCase().replace(/\s+/g, '-')).replace(/-/g, ' ')}</span>
                         <h4 className="modal-item-name">{item.name}</h4>
                         <span className="modal-item-price">₹{getProductFinalPrice(item).toLocaleString('en-IN')}</span>
                       </div>
                       <div className="modal-item-actions">
                         <button 
                           onClick={() => handleRemoveFromCart(item._id || item.id)} 
                           aria-label={`Remove ${item.name}`} 
                           className="modal-item-remove-btn"
                           title="Remove item"
                         >
                           <i className="fa-solid fa-trash-can" />
                         </button>
                       </div>
                     </li>
                   ))}
                 </ul>
                 
                 <div className="modal-total-section">
                   <span className="modal-total-label">Total Amount:</span>
                   <span className="modal-total-value">₹{cartTotal.toLocaleString('en-IN')}</span>
                 </div>
                 
                 <button className="cta-button" onClick={handleCheckoutCart} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                   Proceed to Checkout
                 </button>
               </div>
             )}
           </div>
         </div>
       )}
      
        {/* Wishlist Modal */}
        {showWishlist && (
          <div id="wishlistModal" className="modal-overlay active" style={{ display: 'flex' }}>
            <div className="modal-content" role="dialog" aria-modal="true" style={{ maxWidth: '600px', width: '90%' }}>
              <button className="close-modal" onClick={() => setShowWishlist(false)} aria-label="Close">
                &times;
              </button>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-heart" style={{ color: '#ef4444' }}></i> Your Wishlist
              </h2>
              {waitlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <i className="fa-regular fa-heart" style={{ fontSize: '3rem', color: '#ef4444', opacity: 0.2, marginBottom: '1rem', display: 'block' }}></i>
                  <p style={{ color: 'var(--text-muted)' }}>Your wishlist is empty.</p>
                </div>
              ) : (
                <ul className="modal-item-list">
                  {products.filter(p => waitlist.includes(p._id || p.id)).map((item, idx) => (
                    <li key={idx} className="modal-item-card">
                      <div className="modal-item-img">
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0]} alt={item.name} />
                        ) : (
                          <i className={`fa-solid ${item.icon || 'fa-box'}`}></i>
                        )}
                      </div>
                      <div className="modal-item-details">
                        <span className="modal-item-category">{((item.category || '').toString().includes('-') ? item.category : (item.category || '').toLowerCase().replace(/\s+/g, '-')).replace(/-/g, ' ')}</span>
                        <h4 className="modal-item-name">{item.name}</h4>
                        <span className="modal-item-price">₹{getProductFinalPrice(item).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="modal-item-actions">
                        <button 
                          onClick={async () => {
                            await handleAddToCart(item);
                            await handleToggleWaitlist(item._id || item.id);
                          }}
                          className="modal-item-cart-btn"
                          title="Add to Cart"
                        >
                          <i className="fa-solid fa-cart-plus"></i> Add
                        </button>
                        <button 
                          onClick={() => handleToggleWaitlist(item._id || item.id)} 
                          aria-label={`Remove ${item.name}`} 
                          className="modal-item-remove-btn"
                          title="Remove from Wishlist"
                        >
                          <i className="fa-solid fa-heart-crack" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        

      {/* Entry Modal */}
      <div id="entryModal" className={`modal-overlay ${showEntryModal ? 'active' : ''}`}>
        <div className="modal-content" role="dialog" aria-modal="true">
          <button className="close-modal" onClick={closeEntryModal} aria-label="Close">&times;</button>
          <div className="modal-header">
            <h2>Welcome to The Sri Tech</h2>
            <p>Please enter your details to explore our premium collection.</p>
          </div>
          <form id="entryForm" onSubmit={handleEntrySubmit}>
            <div className="form-group">
              <label htmlFor="userName"><i className="fa-regular fa-user"></i> Name</label>
              <input type="text" id="userName" name="userName" placeholder="Your Full Name" required value={entryName} onChange={e => setEntryName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="userWhatsapp"><i className="fa-brands fa-whatsapp"></i> WhatsApp Number</label>
              <input type="tel" id="userWhatsapp" name="userWhatsapp" placeholder="+1 (555) 000-0000" required value={entryWhatsapp} onChange={e => setEntryWhatsapp(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="userLocation"><i className="fa-solid fa-location-dot"></i> Location</label>
              <input type="text" id="userLocation" name="userLocation" placeholder="City, Country" required value={entryLocation} onChange={e => setEntryLocation(e.target.value)} />
            </div>
            <button type="submit" className="cta-button submit-entry">
              {isEntrySubmitted ? 'Welcome!' : 'Continue to Website'}
            </button>
          </form>
        </div>
      </div>

      {/* Offer Modal */}
      <div id="offerModal" className={`modal-overlay ${showOfferModal ? 'active' : ''}`}>
        <div className="modal-content" style={{ textAlign: 'center', padding: offerData.poster ? '0' : '2rem' }} role="dialog" aria-modal="true">
          <button className="close-modal" onClick={() => setShowOfferModal(false)} aria-label="Close" style={{ zIndex: 10, background: 'rgba(255,255,255,0.8)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', top: '10px', right: '10px' }}>&times;</button>
          
          {offerData.poster && (
            <div className="offer-poster" style={{ width: '100%', maxHeight: '400px', overflow: 'hidden' }}>
              <img src={offerData.poster} alt="Special Offer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          
          <div className="modal-header" style={{ padding: offerData.poster ? '2rem' : '0' }}>
            <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>{offerData.title}</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{offerData.description}</p>
            <div className="promo-code" style={{ 
              background: 'var(--primary-light)', 
              color: 'white', 
              padding: '1rem', 
              borderRadius: '12px', 
              border: '2px dashed white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              letterSpacing: '2px',
              marginBottom: '2rem',
              display: 'inline-block',
              width: '100%',
              maxWidth: '300px'
            }}>
              {offerData.code}
            </div>
          </div>
          <div style={{ padding: offerData.poster ? '0 2rem 2rem 2rem' : '0' }}>
            <button className="cta-button" onClick={() => setShowOfferModal(false)} style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}>Claim Offer Now</button>
          </div>
        </div>
      </div>


      {/* Admin Login Modal */}
      <div id="adminLoginModal" className={`modal-overlay ${showAdminLogin ? 'active' : ''}`}>
        <div className="modal-content glass-card" role="dialog" aria-modal="true">
          <button className="close-modal" onClick={() => { setShowAdminLogin(false); setAdminCredentials({ username: '', password: '' }); }}>&times;</button>
          <div className="modal-header">
            <h2>Admin Portal</h2>
            <p>Please authenticate to access the dashboard.</p>
          </div>
          <form onSubmit={handleAdminLoginSubmit}>
            <div className="form-group">
              <label><i className="fa-solid fa-envelope"></i> Email</label>
              <input 
                type="email" 
                placeholder="e.g. admin@example.com" 
                required 
                value={adminCredentials.username}
                onChange={(e) => setAdminCredentials({...adminCredentials, username: e.target.value})}
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label><i className="fa-solid fa-key"></i> Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="cta-button" style={{ width: '100%', marginTop: '1rem' }}>
              Login to Dashboard
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Authorized access only.
          </p>
        </div>
      </div>

      {/* ============================================================
           PREMIUM USER LOGIN PORTAL — Full-Screen Split Layout
      ============================================================ */}
      {showAuthModal && (
        <div
          id="authModal"
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            animation: 'fadeInPortal 0.3s ease',
            padding: '1rem'
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            width: '100%', maxWidth: '860px',
            minHeight: '560px',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
            animation: 'slideUpPortal 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            background: '#fff'
          }} className="auth-portal-grid">

            {/* ── LEFT: Brand Panel ── */}
            <div style={{
              background: 'linear-gradient(145deg, #14532d 0%, #16a34a 45%, #4ade80 100%)',
              padding: '3rem 2.5rem',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Decorative circles */}
              <div style={{ position:'absolute', top:'-60px', left:'-60px', width:'220px', height:'220px', borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', bottom:'-80px', right:'-50px', width:'280px', height:'280px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', top:'40%', left:'60%', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />

              {/* Logo */}
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'2.5rem' }}>
                  <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}>
                    <i className="fa-solid fa-leaf" style={{ color:'white', fontSize:'1.2rem' }}></i>
                  </div>
                  <span style={{ color:'white', fontWeight:800, fontSize:'1.4rem', letterSpacing:'0.5px' }}>SriTech</span>
                </div>
                <h2 style={{ color:'white', fontSize:'2rem', fontWeight:800, lineHeight:1.2, marginBottom:'1rem' }}>
                  {authMode === 'login' ? 'Welcome\nBack! 👋' : authMode === 'signup' ? 'Join Our\nFamily 🌿' : 'Almost\nThere! 📬'}
                </h2>
                <p style={{ color:'rgba(255,255,255,0.82)', fontSize:'0.95rem', lineHeight:1.6 }}>
                  {authMode === 'login'
                    ? 'Sign in to explore premium products, track orders, and enjoy exclusive member benefits.'
                    : authMode === 'signup'
                    ? 'Create your account today and unlock personalized shopping, early access deals & more.'
                    : `We've sent a 6-digit code to ${userCredentials.email}. Check your inbox!`}
                </p>
              </div>

              {/* Feature bullets */}
              <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                {[
                  { icon:'fa-shield-halved', text:'Secure & encrypted account' },
                  { icon:'fa-truck-fast',    text:'Track all your orders in real-time' },
                  { icon:'fa-tag',           text:'Exclusive member-only discounts' },
                ].map((f, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <i className={`fa-solid ${f.icon}`} style={{ color:'white', fontSize:'0.85rem' }}></i>
                    </div>
                    <span style={{ color:'rgba(255,255,255,0.9)', fontSize:'0.85rem', fontWeight:500 }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Form Panel ── */}
            <div style={{ padding:'2.5rem 2.5rem', display:'flex', flexDirection:'column', justifyContent:'center', background:'#ffffff', overflowY:'auto' }}>

              {/* Close button — only shown if portal is NOT a mandatory gate */}
              {!authPortalIsGate && (
                <button
                  onClick={() => { setShowAuthModal(false); setAuthMode('login'); setUserCredentials({ name:'',email:'',password:'',confirmPassword:'' }); setOtpCode(''); }}
                  style={{ position:'absolute', top:'1rem', right:'1rem', background:'rgba(0,0,0,0.06)', border:'none', width:'34px', height:'34px', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', color:'#64748b', transition:'all 0.2s' }}
                  aria-label="Close"
                  onMouseOver={e => e.currentTarget.style.background='rgba(239,68,68,0.12)'}
                  onMouseOut={e => e.currentTarget.style.background='rgba(0,0,0,0.06)'}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}

              {/* Tab switcher */}
              {authMode !== 'verify-otp' && (
                <div style={{ display:'flex', background:'#f0fdf4', borderRadius:'12px', padding:'4px', marginBottom:'1.75rem', border:'1px solid #d1fae5' }}>
                  {['login','signup'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAuthMode(mode)}
                      style={{
                        flex:1, padding:'0.6rem', borderRadius:'9px', border:'none',
                        fontWeight:600, fontSize:'0.9rem', cursor:'pointer',
                        background: authMode === mode ? 'var(--primary-color)' : 'transparent',
                        color: authMode === mode ? 'white' : '#64748b',
                        transition:'all 0.25s ease',
                        boxShadow: authMode === mode ? '0 4px 12px rgba(22,163,74,0.3)' : 'none'
                      }}
                    >
                      {mode === 'login' ? '🔑 Sign In' : '✨ Sign Up'}
                    </button>
                  ))}
                </div>
              )}

              <h3 style={{ fontSize:'1.5rem', fontWeight:800, color:'#14532d', marginBottom:'0.35rem' }}>
                {authMode === 'login' ? 'Sign in to your account' : authMode === 'signup' ? 'Create your account' : 'Enter your OTP'}
              </h3>
              <p style={{ fontSize:'0.85rem', color:'#64748b', marginBottom:'1.5rem' }}>
                {authMode === 'verify-otp' ? `6-digit code sent to ${userCredentials.email}` : 'Fill in your details below to continue'}
              </p>

              <form onSubmit={handleUserAuthSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

                {/* OTP Mode */}
                {authMode === 'verify-otp' && (
                  <div>
                    <label style={{ fontSize:'0.8rem', fontWeight:600, color:'#475569', display:'block', marginBottom:'6px' }}>
                      <i className="fa-solid fa-key" style={{ marginRight:'5px', color:'var(--primary-color)' }}></i>OTP Code
                    </label>
                    <input
                      type="text"
                      placeholder="• • • • • •"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g,''))}
                      autoComplete="off"
                      style={{
                        width:'100%', padding:'1rem', textAlign:'center',
                        letterSpacing:'12px', fontSize:'1.6rem', fontWeight:700,
                        border:'2px solid #d1fae5', borderRadius:'12px',
                        outline:'none', color:'var(--primary-dark)',
                        background:'#f0fdf4', fontFamily:'monospace',
                        transition:'border-color 0.2s'
                      }}
                      onFocus={e => e.target.style.borderColor='var(--primary-color)'}
                      onBlur={e => e.target.style.borderColor='#d1fae5'}
                    />
                    <div style={{ textAlign:'center', marginTop:'0.75rem' }}>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0}
                        style={{
                          background:'none', border:'none', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                          color: resendTimer > 0 ? '#94a3b8' : 'var(--primary-color)',
                          fontWeight:600, fontSize:'0.85rem',
                          textDecoration: resendTimer > 0 ? 'none' : 'underline'
                        }}
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Login / Signup fields */}
                {authMode !== 'verify-otp' && (
                  <>
                    {authMode === 'signup' && (
                      <div>
                        <label style={{ fontSize:'0.8rem', fontWeight:600, color:'#475569', display:'block', marginBottom:'6px' }}>
                          <i className="fa-regular fa-user" style={{ marginRight:'5px', color:'var(--primary-color)' }}></i>Full Name
                        </label>
                        <input
                          type="text" placeholder="e.g. Sankarganesh R" required
                          value={userCredentials.name}
                          onChange={(e) => setUserCredentials({...userCredentials, name: e.target.value})}
                          autoComplete="off"
                          style={{ width:'100%', padding:'0.75rem 1rem', border:'1.5px solid #e2e8f0', borderRadius:'10px', outline:'none', fontSize:'0.9rem', background:'#fafafa', transition:'all 0.2s', boxSizing:'border-box' }}
                          onFocus={e => { e.target.style.borderColor='var(--primary-color)'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.12)'; e.target.style.background='white'; }}
                          onBlur={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background='#fafafa'; }}
                        />
                      </div>
                    )}
                    <div>
                      <label style={{ fontSize:'0.8rem', fontWeight:600, color:'#475569', display:'block', marginBottom:'6px' }}>
                        <i className="fa-regular fa-envelope" style={{ marginRight:'5px', color:'var(--primary-color)' }}></i>Email Address
                      </label>
                      <input
                        type="email" placeholder="you@example.com" required
                        value={userCredentials.email}
                        onChange={(e) => setUserCredentials({...userCredentials, email: e.target.value})}
                        autoComplete="off"
                        style={{ width:'100%', padding:'0.75rem 1rem', border:'1.5px solid #e2e8f0', borderRadius:'10px', outline:'none', fontSize:'0.9rem', background:'#fafafa', transition:'all 0.2s', boxSizing:'border-box' }}
                        onFocus={e => { e.target.style.borderColor='var(--primary-color)'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.12)'; e.target.style.background='white'; }}
                        onBlur={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background='#fafafa'; }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize:'0.8rem', fontWeight:600, color:'#475569', display:'block', marginBottom:'6px' }}>
                        <i className="fa-solid fa-lock" style={{ marginRight:'5px', color:'var(--primary-color)' }}></i>Password
                      </label>
                      <input
                        type="password" placeholder="••••••••" required
                        value={userCredentials.password}
                        onChange={(e) => setUserCredentials({...userCredentials, password: e.target.value})}
                        autoComplete="new-password"
                        style={{ width:'100%', padding:'0.75rem 1rem', border:'1.5px solid #e2e8f0', borderRadius:'10px', outline:'none', fontSize:'0.9rem', background:'#fafafa', transition:'all 0.2s', boxSizing:'border-box' }}
                        onFocus={e => { e.target.style.borderColor='var(--primary-color)'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.12)'; e.target.style.background='white'; }}
                        onBlur={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background='#fafafa'; }}
                      />
                    </div>
                    {authMode === 'signup' && (
                      <div>
                        <label style={{ fontSize:'0.8rem', fontWeight:600, color:'#475569', display:'block', marginBottom:'6px' }}>
                          <i className="fa-solid fa-lock" style={{ marginRight:'5px', color:'var(--primary-color)' }}></i>Confirm Password
                        </label>
                        <input
                          type="password" placeholder="••••••••" required
                          value={userCredentials.confirmPassword}
                          onChange={(e) => setUserCredentials({...userCredentials, confirmPassword: e.target.value})}
                          autoComplete="new-password"
                          style={{ width:'100%', padding:'0.75rem 1rem', border:'1.5px solid #e2e8f0', borderRadius:'10px', outline:'none', fontSize:'0.9rem', background:'#fafafa', transition:'all 0.2s', boxSizing:'border-box' }}
                          onFocus={e => { e.target.style.borderColor='var(--primary-color)'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.12)'; e.target.style.background='white'; }}
                          onBlur={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background='#fafafa'; }}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  style={{
                    width:'100%', padding:'0.85rem',
                    background:'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                    color:'white', border:'none', borderRadius:'12px',
                    fontWeight:700, fontSize:'1rem', cursor:'pointer',
                    boxShadow:'0 6px 20px rgba(22,163,74,0.35)',
                    transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    marginTop:'0.25rem'
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(22,163,74,0.4)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(22,163,74,0.35)'; }}
                >
                  {authMode === 'login' ? '🔑 Sign In to Account' : authMode === 'signup' ? '🚀 Create My Account' : '✅ Verify & Continue'}
                </button>

                {/* Go back link for OTP mode */}
                {authMode === 'verify-otp' && (
                  <button type="button" onClick={() => setAuthMode('signup')}
                    style={{ background:'none', border:'none', color:'#64748b', fontSize:'0.85rem', cursor:'pointer', textDecoration:'underline', textAlign:'center' }}>
                    ← Wrong email? Go back
                  </button>
                )}
              </form>

              {/* Terms note */}
              {authMode === 'signup' && (
                <p style={{ fontSize:'0.75rem', color:'#94a3b8', textAlign:'center', marginTop:'1rem', lineHeight:1.5 }}>
                  By signing up, you agree to our <span style={{ color:'var(--primary-color)', fontWeight:600 }}>Terms of Service</span> and <span style={{ color:'var(--primary-color)', fontWeight:600 }}>Privacy Policy</span>.
                </p>
              )}

              {/* Continue as Guest — always visible */}
              {authMode !== 'verify-otp' && (
                <div style={{ textAlign:'center', marginTop:'1.25rem', paddingTop:'1rem', borderTop:'1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthModal(false);
                      setAuthPortalIsGate(false);
                      setAuthMode('login');
                      setUserCredentials({ name:'',email:'',password:'',confirmPassword:'' });
                    }}
                    style={{
                      background: 'none', border: 'none',
                      color: '#64748b', fontSize: '0.85rem',
                      cursor: 'pointer', fontWeight: 500,
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '0.4rem 0.75rem', borderRadius: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; }}
                  >
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.75rem' }}></i>
                    Continue as Guest
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Inline keyframe styles */}
          <style>{`
            @keyframes fadeInPortal { from { opacity:0 } to { opacity:1 } }
            @keyframes slideUpPortal { from { opacity:0; transform: translateY(40px) scale(0.95) } to { opacity:1; transform: translateY(0) scale(1) } }
            @media (max-width: 640px) {
              .auth-portal-grid { grid-template-columns: 1fr !important; }
              .auth-portal-grid > div:first-child { display: none !important; }
            }
          `}</style>
        </div>
      )}

      {/* Complaint / Support Modal */}
      <div id="complaintModal" className={`modal-overlay ${showComplaintModal ? 'active' : ''}`}>
        <div className="modal-content glass-card" style={{ maxWidth: '500px' }} role="dialog" aria-modal="true">
          <button className="close-modal" onClick={() => setShowComplaintModal(false)}>&times;</button>
          <div className="modal-header">
            <h2>Customer Support</h2>
            <p>Have a complaint or feedback? Raise a ticket here.</p>
          </div>
          <form onSubmit={handleComplaintSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                placeholder="Your Name" 
                required 
                value={complaintForm.customerName}
                onChange={(e) => setComplaintForm({...complaintForm, customerName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="your.email@example.com" 
                required 
                value={complaintForm.email}
                onChange={(e) => setComplaintForm({...complaintForm, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input 
                type="text" 
                placeholder="e.g. Order Delivery, Product Quality" 
                required 
                value={complaintForm.subject}
                onChange={(e) => setComplaintForm({...complaintForm, subject: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Message / Details</label>
              <textarea 
                placeholder="Describe your issue in detail..." 
                required 
                rows="4"
                value={complaintForm.message}
                onChange={(e) => setComplaintForm({...complaintForm, message: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: '#ffffff', color: '#0f172a', resize: 'vertical' }}
              />
            </div>
            <button type="submit" className="cta-button" style={{ width: '100%', marginTop: '1rem' }}>
              Submit Support Ticket
            </button>
          </form>
        </div>
      </div>

      {/* Header */}
      <header className="top-header">
        <div className="header-container">
          <a href="#" className="logo">
            <span className="logo-main-text">SriTech</span>
            <span className="logo-sub-text">Explore <span>Plus <i className="fa-solid fa-plus" style={{ fontSize: '0.6rem' }}></i></span></span>
          </a>

          <div className="search-container" ref={searchContainerRef}>
            <input 
              type="text" 
              id="searchInput" 
              className="search-input" 
              placeholder="Search for products, categories and more" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <i className="fa-solid fa-magnifying-glass search-icon-inside" onClick={handleRefresh}></i>
            {showSuggestions && searchTerm.trim() !== "" && (
              <div className="search-suggestions-dropdown">
                <div className="search-suggestions-header">Product Suggestions</div>
                {matchedSuggestions.length > 0 ? (
                  matchedSuggestions.slice(0, 5).map(prod => (
                    <div 
                      key={prod._id || prod.id} 
                      className="search-suggestion-item"
                      onClick={() => handleSuggestionClick(prod)}
                    >
                      <div className="search-suggestion-img">
                        {prod.images && prod.images.length > 0 ? (
                          <img src={prod.images[0]} alt={prod.name} />
                        ) : (
                          <i className={`fa-solid ${prod.icon || 'fa-box'}`}></i>
                        )}
                      </div>
                      <div className="search-suggestion-info">
                        <span className="search-suggestion-name">{prod.name}</span>
                        <div className="search-suggestion-meta">
                          <span className="search-suggestion-category">{prod.category ? prod.category.replace(/-/g, ' ') : ''}</span>
                          <span className="search-suggestion-price">₹{parsePrice(prod.price).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <button 
                        className="suggestion-view-btn" 
                        style={{
                          background: 'var(--primary-color)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSuggestionClick(prod);
                        }}
                      >
                        View
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="search-suggestions-empty">
                    No related products found
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="header-actions">
            <div className="user-profile-actions">
              {isUserLoggedIn ? (
                <div className="logged-in-user" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{activeUser?.name}</span>
                   <button onClick={handleLogout} className="action-btn" title="Logout" style={{ opacity: 0.8 }} aria-label="Logout">
                    <i className="fa-solid fa-power-off" aria-hidden="true"></i>
                  </button>
                </div>
              ) : (
                <button 
                  className="header-login-btn" 
                  onClick={() => { 
                    setAuthMode('login'); 
                    setShowAuthModal(true); 
                    setUserCredentials({ name: '', email: '', password: '' });
                  }}
                >
                  Login
                </button>
              )}
            </div>

            <button className="action-btn" title="Wishlist" aria-label="View wishlist" onClick={() => setShowWishlist(true)}>
              <i className={waitlist.length > 0 ? "fa-solid fa-heart" : "fa-regular fa-heart"} aria-hidden="true" style={waitlist.length > 0 ? {color: 'var(--accent-yellow)'} : {}}></i>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Wishlist</span>
            </button>

            <button className="action-btn cart-btn" title="Cart" aria-label={`View shopping cart with ${cart.length} items`} onClick={() => setShowCart(true)}>
              <i className="fa-solid fa-cart-shopping" aria-hidden="true"></i>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Cart</span>
              {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
            </button>

            <button 
              className="action-btn" 
              title="Raise a Complaint" 
              aria-label="Raise a Complaint"
              onClick={() => setShowComplaintModal(true)}
              style={{ color: 'var(--accent-yellow)', fontSize: '0.9rem', fontWeight: 600 }}
            >
              <i className="fa-solid fa-headset"></i> Support
            </button>

            <button 
              className={`action-btn refresh-btn ${isRefreshing ? 'spinning' : ''}`} 
              onClick={handleRefresh}
              title="Refresh Data"
              aria-label="Refresh Data"
              style={{ color: 'white' }}
            >
              <i className="fa-solid fa-arrows-rotate"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Category Navigation Bar (Flipkart-Style) */}
      <div className="category-bar-wrapper">
        <div className="category-bar-container">
          {['all', ...categories].map(cat => {
            let iconClass = 'fa-boxes-stacked';
            if (cat === 'all') iconClass = 'fa-border-all';
            else if (cat.includes('stove')) iconClass = 'fa-fire';
            else if (cat.includes('appliances')) iconClass = 'fa-home';
            else if (cat.includes('welding')) iconClass = 'fa-bolt';
            else if (cat.includes('engraining') || cat.includes('engraver')) iconClass = 'fa-gears';

            return (
              <button 
                key={cat}
                className={`category-bar-item ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  handleCategoryChange(cat);
                  const el = document.getElementById('product');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <i className={`fa-solid ${iconClass}`}></i>
                <span>{cat === 'all' ? 'All Products' : cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
              </button>
            );
          })}
        </div>
      </div>


      <main>
        {/* Promo Offer Banner (Flipkart-Style Carousel) */}
        {offerData && (
          <div className="promo-carousel">
            <div className="promo-banner">
              <div className="promo-banner-content">
                <span className="promo-badge">Limited Time Offer</span>
                <h2 style={{ marginTop: '0.5rem' }}>{offerData.title || 'Special Deal Alert!'}</h2>
                <p style={{ marginTop: '0.5rem' }}>{offerData.description || 'Check out our premium collection and get massive discounts.'}</p>
                {offerData.code && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Use Code:</span>
                    <span style={{ border: '1.5px dashed var(--accent-yellow)', padding: '0.2rem 0.6rem', borderRadius: '2px', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--accent-yellow)', fontWeight: 800, letterSpacing: '0.5px', fontSize: '0.85rem' }}>
                      {offerData.code}
                    </span>
                  </div>
                )}
              </div>
              {offerData.poster ? (
                <div style={{ maxWidth: '280px', height: '140px' }}>
                  <img src={offerData.poster} alt="Offer poster" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <button className="promo-banner-action" onClick={(e) => scrollToSection(e, 'product')}>
                  Shop Now
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Product Coupons (Flipkart-style Coupon row) */}
        {coupons.filter(c => c.isActive && c.linkedProduct).length > 0 && (
          <div className="coupons-offers-row" style={{ padding: '1rem 2rem', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-ticket" style={{ color: '#4f46e5' }}></i> Linked Product Coupon Offers
              </h3>
              <div className="coupons-offers-container" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {coupons.filter(c => c.isActive && c.linkedProduct && (!c.expiryDate || new Date(c.expiryDate) > new Date())).map(c => {
                  const linkedProd = products.find(p => (p._id || p.id) === c.linkedProduct);
                  if (!linkedProd) return null;
                  return (
                    <div key={c._id || c.code} className="coupon-deal-card" style={{ 
                      minWidth: '280px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', 
                      padding: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '4px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        {linkedProd.images && linkedProd.images.length > 0 ? (
                          <img src={linkedProd.images[0]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <i className={`fa-solid ${linkedProd.icon || 'fa-box'}`} style={{ color: '#4f46e5', fontSize: '1.5rem' }}></i>
                        )}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', background: 'rgba(16, 185, 129, 0.08)', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                          {c.discountValue}{c.discountType === 'Percentage' ? '%' : '₹'} OFF
                        </span>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{linkedProd.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Use Code: <strong style={{ color: '#4f46e5' }}>{c.code}</strong></span>
                      </div>
                      <button 
                        onClick={() => { setSelectedProduct(linkedProd); setSelectedProductImageIndex(0); }} 
                        style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', padding: '0.4rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        View
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section id="home" className="hero">
          <div className="hero-content">
            <h1>The Sri Tech</h1>
            <p>
              Sri Tech Engineering is a precision manufacturing company founded in 2020, specializing in Agro, Food & Poultry Machineries, Material Fabrication and Engineering Works.
              <br /><br />
              Based in Namakkal, Tamil Nadu, we operate two advanced manufacturing units in Athanoor and Vaiyappamalai. Our prestigious portfolio includes national-scale projects for Indian Railways, IOCL, SIDCO, and Smart City Highway infrastructures.
              <br /><br />
              Led by Sankarganesh R (CEO) and Ganga (MD), SM Group and Sri Tech Engineering focus on Delivering excellence through Innovation, Sustainability & Excellence. We bridge the gap between students and industry through technical skill development.
            </p>
            <a href="#product" className="cta-button" aria-label="Shop our sustainable technology products collection" onClick={(e) => scrollToSection(e, 'product')}>
              Explore Sustainable Tech <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
          <div className="hero-image-carousel">
            <div className="carousel-slide-container" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
              <div 
                className="carousel-track" 
                style={{ 
                  display: 'flex',
                  width: `${displayBanners.length * 100}%`,
                  height: '100%',
                  transform: `translateX(-${(currentHeroIndex * 100) / displayBanners.length}%)`,
                  transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {displayBanners.map((banner, index) => (
                  <div 
                    key={banner._id || index}
                    className="carousel-slide"
                    style={{
                      width: `${100 / displayBanners.length}%`,
                      height: '100%',
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    <img 
                      src={banner.image} 
                      alt={banner.caption || "Sri Tech Premium Engineering Banner"} 
                      loading="eager" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {banner.caption && (
                      <div className="carousel-caption">
                        {banner.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {displayBanners.length > 1 && (
                <div className="carousel-dots">
                  {displayBanners.map((_, index) => (
                    <button
                      key={index}
                      className={`carousel-dot ${index === currentHeroIndex ? 'active' : ''}`}
                      onClick={() => setCurrentHeroIndex(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Product Section */}
        <section id="product" className="products-section">
          <div className="section-header">
            <h2>Our Premium Products</h2>
            <p>Curated excellence for the modern professional</p>
          </div>



          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <article key={product.id || product._id} className="product-card" style={{ animation: 'fadeIn 0.5s ease forwards' }}>
                  <button 
                    className={`like-btn ${waitlist.includes(product.id || product._id) ? 'active' : ''}`} 
                    onClick={() => handleToggleWaitlist(product.id || product._id)}
                    aria-label={waitlist.includes(product.id || product._id) ? "Remove from waitlist" : "Add to wishlist"}
                  >
                    <i className={`fa-${waitlist.includes(product.id || product._id) ? 'solid' : 'regular'} fa-heart`} aria-hidden="true"></i>
                  </button>

                  <div className="product-img" onClick={() => { setSelectedProduct(product); setSelectedProductImageIndex(0); }} style={{ cursor: 'pointer' }}>
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={`${product.name} - ${product.category}`} 
                        className="hover-zoom"
                        loading="lazy"
                      />
                    ) : (
                      <i className={`fa-solid ${product.icon || 'fa-box'} placeholder-img`} aria-hidden="true"></i>
                    )}
                    {product.images && product.images.length > 1 && (
                      <span className="image-badge" style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem' }}>
                        +{product.images.length - 1} photos
                      </span>
                    )}
                  </div>

                  <div className="product-info">
                    <h3 onClick={() => { setSelectedProduct(product); setSelectedProductImageIndex(0); }} style={{ cursor: 'pointer' }}>{product.name}</h3>
                    
                    {/* Rating badge */}
                    {(() => {
                      const charSum = (product._id || product.id || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
                      const rating = (4.1 + (charSum % 8) / 10).toFixed(1);
                      const reviewsCount = 12 + (charSum % 340);
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="rating-badge">{rating} <i className="fa-solid fa-star"></i></span>
                          <span className="rating-count">({reviewsCount})</span>
                        </div>
                      );
                    })()}

                    {/* Price section */}
                    {(() => {
                      const priceNum = parsePrice(product.price);
                      const activeCoupon = coupons.find(c => 
                        c.isActive && 
                        c.linkedProduct === (product._id || product.id) &&
                        (!c.expiryDate || new Date(c.expiryDate) > new Date())
                      );
                      
                      if (activeCoupon) {
                        const discountVal = parseFloat(activeCoupon.discountValue) || 0;
                        let discountedPrice;
                        let discountText;
                        if (activeCoupon.discountType === 'Fixed') {
                          discountedPrice = Math.max(0, priceNum - discountVal);
                          discountText = `₹${discountVal} off`;
                        } else {
                          discountedPrice = Math.round(priceNum * (1 - discountVal / 100));
                          discountText = `${discountVal}% off`;
                        }
                        return (
                          <div className="price-row">
                            <span className="price">₹{discountedPrice.toLocaleString('en-IN')}</span>
                            <span className="original-price">₹{priceNum.toLocaleString('en-IN')}</span>
                            <span className="discount" style={{ color: '#388e3c', fontWeight: 700 }}>{discountText}</span>
                          </div>
                        );
                      }
                      
                      const originalPrice = Math.round(priceNum * 1.35);
                      return (
                        <div className="price-row">
                          <span className="price">₹{priceNum.toLocaleString('en-IN')}</span>
                          <span className="original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
                          <span className="discount">26% off</span>
                        </div>
                      );
                    })()}

                    {/* Assured seal */}
                    <div className="assured-badge-container">
                      <span className="assured-tag">SriTech <span>Assured <i className="fa-solid fa-shield-halved" style={{ fontSize: '0.6rem' }}></i></span></span>
                      <span className="free-delivery-tag">Free delivery</span>
                    </div>

                    <div className="product-actions">
                      <button className="add-to-cart" onClick={() => handleAddToCart(product)} aria-label={`Add ${product.name} to cart`}>Cart</button>
                      <button className="buy-now-btn" onClick={() => handleBuyNow(product)} aria-label={`Buy ${product.name} now`}>Buy</button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                <i className="fa-solid fa-boxes-packing" style={{ fontSize: '3rem', color: 'var(--primary-color)', opacity: 0.2, marginBottom: '1.5rem', display: 'block' }}></i>
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Premium Products Coming Soon</h3>
                <p style={{ color: 'var(--text-muted)' }}>Our team is currently updating our sustainable technology collection. Please check back shortly.</p>
              </div>
            )}
          </div>
        </section>

        {/* New Arrival Section */}
        <section id="new-arrival" className="products-section" style={{ background: '#f8fafc', marginTop: '0' }}>
          <div className="section-header">
            <h2>New Arrivals</h2>
            <p>The latest additions to our premium collection</p>
          </div>

          <div className="product-grid">
            {products.filter(p => p.isNewArrival).length > 0 ? (
              products.filter(p => p.isNewArrival).map(product => (
                <article key={product.id || product._id} className="product-card" style={{ animation: 'fadeIn 0.5s ease forwards' }}>
                  <button 
                    className={`like-btn ${waitlist.includes(product.id || product._id) ? 'active' : ''}`} 
                    onClick={() => handleToggleWaitlist(product.id || product._id)}
                    aria-label={waitlist.includes(product.id || product._id) ? "Remove from waitlist" : "Add to wishlist"}
                  >
                    <i className={`fa-${waitlist.includes(product.id || product._id) ? 'solid' : 'regular'} fa-heart`} aria-hidden="true"></i>
                  </button>

                  <div className="product-img" onClick={() => { setSelectedProduct(product); setSelectedProductImageIndex(0); }} style={{ cursor: 'pointer' }}>
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={`New Arrival: ${product.name}`} 
                        className="hover-zoom"
                        loading="lazy"
                      />
                    ) : (
                      <i className={`fa-solid ${product.icon || 'fa-box'} placeholder-img`} aria-hidden="true"></i>
                    )}
                    <span className="new-badge" style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--primary-color)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>NEW</span>
                  </div>

                  <div className="product-info">
                    <h3 onClick={() => { setSelectedProduct(product); setSelectedProductImageIndex(0); }} style={{ cursor: 'pointer' }}>{product.name}</h3>
                    
                    {/* Rating badge */}
                    {(() => {
                      const charSum = (product._id || product.id || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
                      const rating = (4.1 + (charSum % 8) / 10).toFixed(1);
                      const reviewsCount = 12 + (charSum % 340);
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="rating-badge">{rating} <i className="fa-solid fa-star"></i></span>
                          <span className="rating-count">({reviewsCount})</span>
                        </div>
                      );
                    })()}

                    {/* Price section */}
                    {(() => {
                      const priceNum = parsePrice(product.price);
                      const activeCoupon = coupons.find(c => 
                        c.isActive && 
                        c.linkedProduct === (product._id || product.id) &&
                        (!c.expiryDate || new Date(c.expiryDate) > new Date())
                      );
                      
                      if (activeCoupon) {
                        const discountVal = parseFloat(activeCoupon.discountValue) || 0;
                        let discountedPrice;
                        let discountText;
                        if (activeCoupon.discountType === 'Fixed') {
                          discountedPrice = Math.max(0, priceNum - discountVal);
                          discountText = `₹${discountVal} off`;
                        } else {
                          discountedPrice = Math.round(priceNum * (1 - discountVal / 100));
                          discountText = `${discountVal}% off`;
                        }
                        return (
                          <div className="price-row">
                            <span className="price">₹{discountedPrice.toLocaleString('en-IN')}</span>
                            <span className="original-price">₹{priceNum.toLocaleString('en-IN')}</span>
                            <span className="discount" style={{ color: '#388e3c', fontWeight: 700 }}>{discountText}</span>
                          </div>
                        );
                      }
                      
                      const originalPrice = Math.round(priceNum * 1.35);
                      return (
                        <div className="price-row">
                          <span className="price">₹{priceNum.toLocaleString('en-IN')}</span>
                          <span className="original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
                          <span className="discount">26% off</span>
                        </div>
                      );
                    })()}

                    {/* Assured seal */}
                    <div className="assured-badge-container">
                      <span className="assured-tag">SriTech <span>Assured <i className="fa-solid fa-shield-halved" style={{ fontSize: '0.6rem' }}></i></span></span>
                      <span className="free-delivery-tag">Free delivery</span>
                    </div>

                    <div className="product-actions">
                      <button className="add-to-cart" onClick={() => handleAddToCart(product)} aria-label={`Add ${product.name} to cart`}>Cart</button>
                      <button className="buy-now-btn" onClick={() => handleBuyNow(product)} aria-label={`Buy ${product.name} now`}>Buy</button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '3rem', color: 'var(--primary-color)', opacity: 0.2, marginBottom: '1.5rem', display: 'block' }}></i>
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Fresh Arrivals Coming Soon</h3>
                <p style={{ color: 'var(--text-muted)' }}>We are preparing our latest collection. Stay tuned for exciting new products!</p>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-details">
            <a href="#" className="footer-logo">The Sri Tech</a>
            <p>11/1, Gurusamipalayam, Rasipuram, Tamil Nadu 637403</p>
            <p>thesmgroups@gmail.com</p>
            <p>+91 9043340278</p>
            <div className="social-links">
              <a href="https://www.instagram.com/thesritech?utm_source=qr&igsh=MWx6b2F5cGV5cXk4eA==" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram" aria-hidden="true"></i></a>
              <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook" aria-hidden="true"></i></a>
              <a href="#" aria-label="Youtube"><i className="fa-brands fa-youtube" aria-hidden="true"></i></a>
            </div>
          </div>

          <div className="footer-links">
            <h3>Quick Links</h3>
            <a href="#home" onClick={(e) => scrollToSection(e, 'home')}>Home</a>
            <a href="#product" onClick={(e) => scrollToSection(e, 'product')}>Products</a>
            <a href="#new-arrival" onClick={(e) => scrollToSection(e, 'new-arrival')}>New Arrivals</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowComplaintModal(true); }}>Raise a Complaint</a>
          </div>

          <div className="complaint-box">
            <h3>Subscribe for Updates</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#a1a1aa' }}>
              Get notified via email when new products are added.
            </p>
            <form id="subscribeForm" onSubmit={async (e) => { 
              e.preventDefault(); 
              const email = e.target.querySelector('input').value;
              try {
                const res = await fetch(`${API_URL}/subscribers`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email })
                });
                if (res.ok) showToast('Successfully subscribed to our newsletter!', 'success');
                else showToast('Already subscribed or invalid email.', 'error');
              } catch (err) {
                console.error("Subscription error:", err);
                showToast('Error subscribing. Please try again.', 'error');
              }
              e.target.reset();
            }}>
              <input type="email" placeholder="Your Email Address" required aria-label="Email for Newsletter" />
              <button type="submit" className="submit-btn">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 The Sri Tech. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
