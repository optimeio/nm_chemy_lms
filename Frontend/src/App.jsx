import { useState, useEffect, useRef, useMemo } from 'react'
import './index.css'
import { createPortal } from 'react-dom'
import AdminDashboard from './AdminDashboard'

const API_URL = '/api';

const normalizeImageValue = (image, { cacheBust = false } = {}) => {
  if (!image || typeof image !== 'string') return '';
  const trimmed = image.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:')) return trimmed;
  if (cacheBust) {
    const separator = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${separator}t=${Date.now()}`;
  }
  return trimmed;
};

const normalizeProductRecord = (product, options = {}) => {
  if (!product || typeof product !== 'object') return product;
  const images = Array.isArray(product.images)
    ? product.images.map((image) => normalizeImageValue(image, options)).filter(Boolean)
    : [];
  return { ...product, images };
};

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
  const fallbackCategories = ['Stoves'];

  const normalizeCategorySlug = (value) => {
    if (!value) return '';
    return value.toString().toLowerCase().trim().replace(/\s+/g, '-');
  };

  const getCategorySlug = (value) => {
    if (!value) return '';
    if (typeof value === 'object') {
      return normalizeCategorySlug(value.slug || value.name || '');
    }
    return normalizeCategorySlug(value);
  };

  const getCategoryDisplayName = (value) => {
    if (!value) return '';
    if (typeof value === 'object') {
      if (value.name) return value.name.toString();
      value = value.slug || '';
    }
    const raw = value.toString();
    return raw
      .split(/[-\s]+/)
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const baseCategories = Array.isArray(categories) && categories.length > 0
    ? categories.map(cat => ({ name: getCategoryDisplayName(cat), slug: getCategorySlug(cat) }))
    : fallbackCategories.map(name => ({ name, slug: getCategorySlug(name) }));

  const hiddenCategorySlugs = [
    'engraining-products',
    'home-appliances',
    'welding-products'
  ];

  const allowedCategorySlugs = ['stoves'];
  const productCategorySlugs = Array.from(new Set(
    products
      .map(p => getCategorySlug(p.category))
      .filter(Boolean)
      .filter(slug => !hiddenCategorySlugs.includes(slug))
  ));

  const productCategories = productCategorySlugs.map(slug => ({
    name: getCategoryDisplayName(slug),
    slug
  }));

  const categoryItems = [...baseCategories, ...productCategories]
    .filter(item => item && item.slug && !hiddenCategorySlugs.includes(item.slug))
    .reduce((acc, item) => {
      if (!item || !item.slug) return acc;
      if (!acc.some(existing => existing.slug === item.slug)) {
        acc.push(item);
      }
      return acc;
    }, []);

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
  const [userCredentials, setUserCredentials] = useState({ name: '', phone: '', address: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [activeUser, setActiveUser] = useState(null);
  const [authPortalIsGate, setAuthPortalIsGate] = useState(false); // true = portal is mandatory gate on /

  // Suggestions search state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchContainerRef = useRef(null);

  const filterProductsForDisplay = (sourceProducts = products, query = '', category = selectedCategory) => {
    const selectedCatClean = getCategorySlug(category);

    return sourceProducts.filter(product => {
      const productCategorySlug = getCategorySlug(product.category);
      const matchesCategory = selectedCatClean === 'all' || productCategorySlug === selectedCatClean;

      if (!matchesCategory) return false;

      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) return true;

      const searchableText = [
        product.name,
        product.description,
        product.category,
        getCategoryDisplayName(product.category),
        productCategorySlug,
        product.brand,
        product.shortName,
        product.model
      ].filter(Boolean).join(' ').toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  };

  // Payment/Checkout State
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [checkoutMode, setCheckoutMode] = useState('cart');

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

  const persistAuthSession = (token, user) => {
    if (token) {
      localStorage.setItem('sriTechToken', token);
    }
    if (user) {
      localStorage.setItem('sriTechUser', JSON.stringify(user));
    }
  };

  const clearAuthSession = () => {
    localStorage.removeItem('sriTechToken');
    localStorage.removeItem('sriTechUser');
  };

  const loadGuestCart = () => {
    try {
      const stored = localStorage.getItem('sriTechCart');
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      return [];
    }
  };

  const loadGuestWaitlist = () => {
    try {
      const stored = localStorage.getItem('sriTechWaitlist');
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      return [];
    }
  };

  const saveGuestCart = (items) => {
    try {
      localStorage.setItem('sriTechCart', JSON.stringify(items));
    } catch (err) {
      console.error('Unable to save guest cart:', err);
    }
  };

  const saveGuestWaitlist = (items) => {
    try {
      localStorage.setItem('sriTechWaitlist', JSON.stringify(items));
    } catch (err) {
      console.error('Unable to save guest wishlist:', err);
    }
  };

  // Sync cart & waitlist from DB when user logs in, otherwise load guest local data.
  useEffect(() => {
    if (activeUser) {
      setCart(activeUser.cart || []);
      setWaitlist(activeUser.waitlist || []);
    } else {
      setCart(loadGuestCart());
      setWaitlist(loadGuestWaitlist());
    }
  }, [activeUser]);

  useEffect(() => {
    if (!activeUser) {
      saveGuestCart(cart);
    }
  }, [cart, activeUser]);

  useEffect(() => {
    if (!activeUser) {
      saveGuestWaitlist(waitlist);
    }
  }, [waitlist, activeUser]);

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
      const sections = ['home', 'product'];
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
    let productsLoaded = false;

    // Fetch products
    try {
      const prodRes = await fetch(`${API_URL}/products?t=${t}`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) {
          setProducts(prodData.map((product) => normalizeProductRecord(product)));
          productsLoaded = true;
        } else {
          setProducts([]);
          showToast('Unexpected product response from backend.', 'error');
        }
      } else {
        setProducts([]);
        showToast('Backend error loading products.', 'error');
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
      showToast('Backend unavailable. Please try again later.', 'error');
    }

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
       // Show user login portal immediately as a gate on the main site (disabled)
       // setShowAuthModal(true);
       // setAuthPortalIsGate(true);
    }

    fetchData();
  }, []);

  // Fetch reviews when product is selected
  useEffect(() => {
    if (selectedProduct) {
      setSelectedProductImageIndex(0);
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 100);
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
      if (res.ok) {
        const savedProduct = await res.json();
        setProducts(prev => [savedProduct, ...prev]);
        showToast('Product added successfully!', 'success');
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to add product.', 'error');
      }
    } catch (err) {
      console.error("Error adding product:", err);
      showToast('Error adding product. Please try again.', 'error');
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
        setSelectedProduct(prev => (prev && (prev._id || prev.id) === productId ? null : prev));
        showToast('Product deleted successfully!', 'success');
        const logRes = await fetch(`${API_URL}/logs`);
        setActivityLogs(await logRes.json());
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to delete product.', 'error');
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      showToast('Error deleting product. Please try again.', 'error');
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
        const updatedPayload = await res.json();
        const updated = normalizeProductRecord(updatedPayload, { cacheBust: true });
        setProducts(prev => prev.map(p => (p._id || p.id) === productId ? updated : p));
        setSelectedProduct(prev => (
          prev && (prev._id || prev.id) === productId ? updated : prev
        ));
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

  const addCategory = async (categorySlug) => {
    try {
      const formattedName = categorySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formattedName, slug: categorySlug })
      });
      if (res.ok) {
        const savedCategory = await res.json();
        setCategories(prev => [savedCategory, ...prev]);
        showToast('Category added successfully!', 'success');
        const logRes = await fetch(`${API_URL}/logs`);
        if (logRes.ok) setActivityLogs(await logRes.json());
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to add category.', 'error');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      showToast('Error adding category.', 'error');
    }
  };

  const updateCategory = async (categoryId, newName) => {
    try {
      const newSlug = newName.toLowerCase().trim().replace(/\s+/g, '-');
      const res = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, slug: newSlug })
      });
      if (res.ok) {
        const updatedCategory = await res.json();
        setCategories(prev => prev.map(cat => (cat._id || cat.id) === categoryId ? updatedCategory : cat));
        showToast('Category updated successfully!', 'success');
        const logRes = await fetch(`${API_URL}/logs`);
        if (logRes.ok) setActivityLogs(await logRes.json());
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to update category.', 'error');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      showToast('Error updating category.', 'error');
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCategories(prev => prev.filter(cat => (cat._id || cat.id) !== categoryId));
        showToast('Category deleted successfully!', 'success');
        const logRes = await fetch(`${API_URL}/logs`);
        if (logRes.ok) setActivityLogs(await logRes.json());
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to delete category.', 'error');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      showToast('Error deleting category.', 'error');
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
    const productId = product._id || product.id;

    const addCartLocally = () => {
      setCart(prev => {
        const alreadyInCart = prev.some(item => (item._id || item.id) === productId);
        if (alreadyInCart) {
          showToast(`${product.name} is already in your cart.`, 'info');
          return prev;
        }
        const updated = [...prev, product];
        saveGuestCart(updated);
        showToast(`✅ ${product.name} added to cart!`, 'success');
        return updated;
      });
    };

    if (!isUserLoggedIn) {
      addCartLocally();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/${activeUser._id}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        setCart(prev => {
          const alreadyInCart = prev.some(item => (item._id || item.id) === productId);
          return alreadyInCart ? prev : [...prev, product];
        });
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
      return;
    }
    if (resolvedCartItems.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }
    setCheckoutMode('cart');
    setCheckoutItems(resolvedCartItems);
    setShowCheckout(true);
  };

  // Initiate Razorpay payment
  const handleInitiatePayment = async () => {
    const itemsForCheckout = checkoutItems.length > 0 ? checkoutItems : resolvedCartItems;
    const totalForCheckout = itemsForCheckout.reduce((sum, item) => sum + getProductFinalPrice(item), 0);

    if (!itemsForCheckout || itemsForCheckout.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Step 1: Create Razorpay order
      const orderRes = await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalForCheckout,
          currency: 'INR',
          receipt: `order_${Date.now()}`
        })
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        showToast(errorData.message || 'Failed to create payment order.', 'error');
        setIsProcessingPayment(false);
        return;
      }

      const razorpayOrder = await orderRes.json();
      setPaymentOrder(razorpayOrder);

      // Step 2: Get Razorpay key from backend or use hardcoded
      const keyRes = await fetch(`${API_URL}/payments/get-key`).catch(() => null);
      const razorpayKey = keyRes ? (await keyRes.json()).key : process.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        showToast('Razorpay key not configured. Please contact support.', 'error');
        setIsProcessingPayment(false);
        return;
      }

      // Step 3: Open Razorpay checkout
      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'SriTech',
        description: 'Product Purchase',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          console.log(response);
          await handleVerifyPayment(response);
        },
        prefill: {
          name: activeUser?.name || '',
          email: activeUser?.email || '',
          contact: activeUser?.phone || ''
        },
        theme: {
          color: '#1E7A3B'
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            showToast('Payment cancelled.', 'info');
          }
        }
      };

      if (window.Razorpay) {
        const payment = new window.Razorpay(options);
        payment.open();
      } else {
        showToast('Razorpay not loaded. Please refresh and try again.', 'error');
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      showToast('Error initiating payment. Please try again.', 'error');
      setIsProcessingPayment(false);
    }
  };

  // Verify payment and create order
  const handleVerifyPayment = async (paymentResponse) => {
    try {
      // Verify payment signature with backend
      const verifyRes = await fetch(`${API_URL}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature
        })
      });

      if (!verifyRes.ok) {
        showToast('Payment verification failed. Please contact support.', 'error');
        setIsProcessingPayment(false);
        return;
      }

      // Payment verified - now create the order
      const itemsForCheckout = checkoutItems.length > 0 ? checkoutItems : resolvedCartItems;
      const orderItems = itemsForCheckout.map(p => ({ 
        product: p._id || p.id, 
        quantity: 1, 
        price: getProductFinalPrice(p) 
      }));
      const totalForCheckout = itemsForCheckout.reduce((sum, item) => sum + getProductFinalPrice(item), 0);

      const orderData = {
        customerName: activeUser.name,
        email: activeUser.email,
        items: orderItems,
        totalAmount: String(totalForCheckout),
        paymentId: paymentResponse.razorpay_payment_id,
        paymentStatus: 'completed',
        paymentOrderId: paymentResponse.razorpay_order_id,
        paymentSignature: paymentResponse.razorpay_signature,
        status: 'Processing'
      };

      const createOrderRes = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (createOrderRes.ok) {
        const order = await createOrderRes.json();

        if (checkoutMode === 'cart') {
          try {
            await fetch(`${API_URL}/users/${activeUser._id}/cart`, {
              method: 'DELETE'
            });
          } catch (err) {
            console.error("Error clearing cart on backend:", err);
          }
          setCart([]);
        }

        showToast(`🎉 Payment successful! Order #${order.orderId} placed. Confirmation email sent to ${activeUser.email}`, 'success');
        setShowCart(false);
        setShowCheckout(false);
        setPaymentOrder(null);
        setCheckoutItems([]);
        setCheckoutMode('cart');
      } else {
        showToast('Failed to create order after payment. Please contact support.', 'error');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      showToast('Error verifying payment. Please contact support.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };


  const handleToggleWaitlist = async (productId) => {
    const toggleWishlistLocally = () => {
      setWaitlist(prev => {
        const isPresent = prev.includes(productId);
        const updated = isPresent ? prev.filter(id => id !== productId) : [...prev, productId];
        saveGuestWaitlist(updated);
        showToast(isPresent ? '💔 Removed from wishlist.' : '❤️ Added to wishlist!', 'success');
        return updated;
      });
    };

    if (!isUserLoggedIn) {
      toggleWishlistLocally();
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
      // Redirect user to sign-in/signup modal when they try to buy while unauthenticated
      setSelectedProduct(product);
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    const confirmOrder = window.confirm(`Confirm purchase for ${product.name} at ₹${getProductFinalPrice(product)}?`);
    if (!confirmOrder) return;

    setCheckoutMode('buy-now');
    setCheckoutItems([product]);
    setShowCheckout(true);
    showToast('Secure checkout is ready. Complete payment to place your order.', 'success');
  };


  const handleCategoryChange = (cat) => {
    const nextCategory = getCategorySlug(cat);
    setSelectedCategory(nextCategory);
    setSearchTerm("");
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

  const updateUserCredentials = (field, value) => {
    setUserCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleUserAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthSubmitting(true);

    const currentValues = {
      name: userCredentials.name,
      phone: userCredentials.phone,
      address: userCredentials.address,
      email: userCredentials.email,
      password: userCredentials.password,
      confirmPassword: userCredentials.confirmPassword
    };

    const normalizedEmail = (currentValues.email || '').trim().toLowerCase();
    const normalizedOtp = (otpCode || '').trim();

    try {
      if (authMode === 'signup') {
        if (currentValues.password !== currentValues.confirmPassword) {
          showToast('Passwords do not match!', 'error');
          return;
        }
        const res = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: currentValues.name,
            phone: currentValues.phone,
            address: currentValues.address,
            email: normalizedEmail,
            password: currentValues.password
          })
        });
        if (res.ok) {
          setAuthMode('verify-otp');
          showToast('OTP sent to your email. Please verify.', 'success');
        } else {
          const error = await res.json();
          showToast(error.message || 'Signup failed', 'error');
        }
      } else if (authMode === 'verify-otp') {
        const res = await fetch(`${API_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, otp: normalizedOtp })
        });
        if (res.ok) {
          const data = await res.json();
          const user = data.user || data;
          const token = data.token;
          setActiveUser(user);
          setIsUserLoggedIn(true);
          persistAuthSession(token, user);
          setShowAuthModal(false);
          showToast('✅ Verification complete. Login successful!', 'success');
        } else {
          const error = await res.json();
          showToast(error.message || 'OTP verification failed', 'error');
        }
      } else {
        // Intercept admin credentials to log into the Admin Dashboard
        const adminUsername = 'thesmgroups@gmail.com';
        const adminPassword = 'TSMGPVT@2026';
        if (currentValues.email === adminUsername && currentValues.password === adminPassword) {
          setIsAdmin(true);
          setShowAuthModal(false);
          setUserCredentials({ name: '', email: '', password: '', confirmPassword: '' });
          fetchData();
          showToast('Admin authenticated successfully!', 'success');
          return;
        }

        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, password: currentValues.password })
        });
        if (res.ok) {
          const data = await res.json();
          const user = data.user || data;
          const token = data.token;
          setActiveUser(user);
          setIsUserLoggedIn(true);
          persistAuthSession(token, user);
          setShowAuthModal(false);
          showToast('✅ Login successful!', 'success');
        } else {
          const error = await res.json();
          showToast(error.message || 'Authentication failed', 'error');
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      showToast('Authentication error. Please try again.', 'error');
    } finally {
      setAuthSubmitting(false);
    }

    // IMPORTANT: Do NOT clear password fields after signup submission.
    // Clearing them makes the form look like it reset unexpectedly while the OTP step is loading.
    if (authMode === 'login') {
      setUserCredentials({ name: '', phone: '', address: '', email: '', password: '', confirmPassword: '' });
      setOtpCode('');
    }
    if (authMode === 'signup') {
      setOtpCode('');
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setIsUserLoggedIn(false);
    setActiveUser(null);
    setAuthMode('login');
    setUserCredentials({ name: '', phone: '', address: '', email: '', password: '', confirmPassword: '' });
    setOtpCode('');
    setShowAuthModal(false);
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
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
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
  const checkoutItemsForDisplay = checkoutItems.length > 0 ? checkoutItems : resolvedCartItems;
  const checkoutTotal = checkoutItemsForDisplay.reduce((sum, item) => sum + getProductFinalPrice(item), 0);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const matchedSuggestions = normalizedSearchTerm === "" ? [] : products.filter(product => {
    const productCategorySlug = getCategorySlug(product.category);
    const searchableText = [
      product.name,
      product.description,
      product.category,
      getCategoryDisplayName(product.category),
      productCategorySlug,
      product.brand,
      product.shortName,
      product.model
    ].filter(Boolean).join(' ').toLowerCase();

    return searchableText.includes(normalizedSearchTerm);
  });

  const handleSuggestionClick = (product) => {
    setSelectedProduct(product);
    setSelectedProductImageIndex(0);
    setShowSuggestions(false);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: userCredentials.name || 'User',
          phone: userCredentials.phone || '',
          address: userCredentials.address || '',
          email: (userCredentials.email || '').trim().toLowerCase(),
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

  const filteredProducts = useMemo(() => {
    return filterProductsForDisplay(products, searchTerm, selectedCategory);
  }, [products, searchTerm, selectedCategory]);

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
                    <img loading="lazy" 
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
                        <img loading="lazy" src={img} alt={`Thumbnail ${idx + 1}`} />
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
                {typeof selectedProduct.stock === 'number' && (
                  <div className="stock-info" style={{ marginBottom: '1rem', fontWeight: 600, color: selectedProduct.stock > 0 ? '#15803d' : '#b91c1c' }}>
                    {selectedProduct.stock > 0 ? `In stock: ${selectedProduct.stock}` : 'Out of stock'}
                  </div>
                )}
                <p className="description-text">
                  {selectedProduct.description || `Experience top-tier quality and premium design with our ${selectedProduct.name}. Crafted carefully to blend cutting-edge performance with eco-friendly efficiency.`}
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
                  <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ color: 'var(--primary-color)', margin: '0' }}>Share Your Experience</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0' }}>You can rate this product below.</p>
                    
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
                          <img loading="lazy" src={relatedProduct.images[0]} alt={relatedProduct.name} />
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
                           <img loading="lazy" src={item.images[0]} alt={item.name} />
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

       {/* Checkout Modal */}
       {showCheckout && (
         <div id="checkoutModal" className="modal-overlay active" style={{ display: 'flex' }}>
           <div className="modal-content" role="dialog" aria-modal="true" style={{ maxWidth: '700px', width: '90%' }}>
             <button className="close-modal" onClick={() => setShowCheckout(false)} aria-label="Close" disabled={isProcessingPayment}>
               &times;
             </button>
             <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <i className="fa-solid fa-credit-card"></i> Order Checkout
             </h2>

             {/* Order Summary */}
             <div style={{ backgroundColor: 'rgba(30, 122, 59, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--accent-color)' }}>
               <h3 style={{ color: 'var(--accent-color)', marginBottom: '1rem', fontSize: '1.1rem' }}>Order Summary</h3>
               
               <div style={{ marginBottom: '1rem' }}>
                 <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Customer Details</h4>
                 <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                   <strong>Name:</strong> {activeUser?.name || 'N/A'}
                 </p>
                 <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                   <strong>Email:</strong> {activeUser?.email || 'N/A'}
                 </p>
               </div>

               <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1rem' }}>
                 <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Items ({checkoutItemsForDisplay.length})</h4>
                 <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                   {checkoutItemsForDisplay.map((item, idx) => (
                     <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(30, 122, 59, 0.2)', fontSize: '0.9rem' }}>
                       <span style={{ color: 'var(--text-main)' }}>{item.name}</span>
                       <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>₹{getProductFinalPrice(item).toLocaleString('en-IN')}</span>
                     </li>
                   ))}
                 </ul>
               </div>

               <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>Total Amount:</span>
                 <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>₹{checkoutTotal.toLocaleString('en-IN')}</span>
               </div>
             </div>

             {/* Action Buttons */}
             <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
               <button 
                 className="cta-button" 
                 onClick={handleInitiatePayment}
                 disabled={isProcessingPayment}
                 style={{ 
                   width: '100%', 
                   padding: '1rem', 
                   fontSize: '1.1rem',
                   opacity: isProcessingPayment ? 0.7 : 1,
                   cursor: isProcessingPayment ? 'not-allowed' : 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '0.5rem'
                 }}
               >
                 {isProcessingPayment ? (
                   <>
                     <i className="fa-solid fa-spinner fa-spin"></i> Processing...
                   </>
                 ) : (
                   <>
                     <i className="fa-solid fa-lock"></i> Pay Now
                   </>
                 )}
               </button>
               
               <button 
                 onClick={() => setShowCheckout(false)}
                 disabled={isProcessingPayment}
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   fontSize: '1rem',
                   backgroundColor: 'transparent',
                   color: 'var(--accent-color)',
                   border: '2px solid var(--accent-color)',
                   borderRadius: '8px',
                   cursor: isProcessingPayment ? 'not-allowed' : 'pointer',
                   opacity: isProcessingPayment ? 0.7 : 1,
                   fontWeight: '600'
                 }}
               >
                 Continue Shopping
               </button>
             </div>
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
                          <img loading="lazy" src={item.images[0]} alt={item.name} />
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
              <img loading="lazy" src={offerData.poster} alt="Special Offer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
      {showAuthModal && createPortal(
        <div className="auth-split-overlay">
          
          {/* ── LEFT PANE: Cinematic Background ── */}
          <div className="auth-left-pane">
            <div className="auth-left-content">
              <h2>Cook Smarter.<span>Save More.</span></h2>
              <p className="auth-subhead">Join thousands of customers using fuel-efficient Rocket Stoves for sustainable cooking and a cleaner future.</p>
              <ul className="auth-trust-list">
                <li><i className="fa-solid fa-shield-halved"></i> Secure Login & Checkout</li>
                <li><i className="fa-solid fa-truck-fast"></i> Lightning Fast Delivery Tracking</li>
                <li><i className="fa-solid fa-headset"></i> 24/7 Dedicated Support</li>
                <li><i className="fa-solid fa-leaf"></i> 100% Eco-Friendly Materials</li>
              </ul>
            </div>
            
            {/* Floating embers animation */}
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="ember" 
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                  width: `${3 + Math.random() * 4}px`,
                  height: `${3 + Math.random() * 4}px`
                }}
              />
            ))}
          </div>

          {/* ── RIGHT PANE: Glassmorphism Form ── */}
          <div className="auth-right-pane">
            <div className="auth-glass-card">
              <button
                className="auth-close-btn"
                onClick={() => { setShowAuthModal(false); setAuthMode('login'); setUserCredentials({ name:'',email:'',password:'',confirmPassword:'' }); setOtpCode(''); }}
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              <div className="auth-header">
                <h3>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
                <p>{authMode === 'login' ? 'Sign in to your premium account' : 'Start your sustainable journey today'}</p>
              </div>

              {/* Toggle Switch */}
              <div className="auth-toggle-group">
                <button 
                  type="button"
                  className={`auth-toggle-btn ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthMode('login')}
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  className={`auth-toggle-btn ${authMode === 'signup' ? 'active' : ''}`}
                  onClick={() => setAuthMode('signup')}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleUserAuthSubmit}>
                
                {/* Sign Up Specific Fields */}
                {authMode === 'signup' && (
                  <>
                    <div className="auth-form-group">
                      <label>Full Name</label>
                      <div className="auth-input-wrapper">
                        <i className="fa-regular fa-user prefix-icon"></i>
                        <input 
                          type="text" 
                          name="name"
                          className="auth-input" 
                          placeholder="John Doe" 
                          required
                          value={userCredentials.name}
                          onChange={(e) => updateUserCredentials('name', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="auth-form-group">
                      <label>Mobile Number</label>
                      <div className="auth-input-wrapper">
                        <i className="fa-solid fa-phone prefix-icon"></i>
                        <input 
                          type="tel" 
                          name="phone"
                          className="auth-input" 
                          placeholder="+1 (555) 000-0000" 
                          required
                          value={userCredentials.phone}
                          onChange={(e) => updateUserCredentials('phone', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="auth-form-group">
                      <label>Address</label>
                      <div className="auth-input-wrapper">
                        <i className="fa-solid fa-map-location-dot prefix-icon"></i>
                        <input 
                          type="text" 
                          name="address"
                          className="auth-input" 
                          placeholder="123 Street Name" 
                          required
                          value={userCredentials.address || ''}
                          onChange={(e) => updateUserCredentials('address', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {authMode === 'verify-otp' && (
                  <div className="auth-form-group">
                    <label>Verification Code</label>
                    <div className="auth-input-wrapper">
                      <i className="fa-solid fa-key prefix-icon"></i>
                      <input 
                        type="text" 
                        className="auth-input" 
                        placeholder="Enter 6-digit code" 
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Common Fields: Email */}
                <div className="auth-form-group">
                  <label>Email Address</label>
                  <div className="auth-input-wrapper">
                    <i className="fa-regular fa-envelope prefix-icon"></i>
                    <input 
                      type="email" 
                      name="email"
                      className="auth-input" 
                      placeholder="hello@example.com" 
                      required
                      value={userCredentials.email}
                      onChange={(e) => updateUserCredentials('email', e.target.value)}
                    />
                  </div>
                </div>

                {/* Common Fields: Password */}
                {authMode !== 'verify-otp' && (
                  <div className="auth-form-group">
                    <label>Password</label>
                    <div className="auth-input-wrapper">
                      <i className="fa-solid fa-lock prefix-icon"></i>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        className="auth-input" 
                        placeholder="••••••••" 
                        required
                        value={userCredentials.password}
                        onChange={(e) => updateUserCredentials('password', e.target.value)}
                      />
                      <button type="button" className="pwd-toggle" onClick={() => setShowPassword(!showPassword)}>
                        <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Sign Up Specific Field: Confirm Password */}
                {authMode === 'signup' && (
                  <div className="auth-form-group">
                    <label>Confirm Password</label>
                    <div className="auth-input-wrapper">
                      <i className="fa-solid fa-shield-check prefix-icon"></i>
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirmPassword"
                        className="auth-input" 
                        placeholder="••••••••" 
                        required
                        value={userCredentials.confirmPassword}
                        onChange={(e) => updateUserCredentials('confirmPassword', e.target.value)}
                      />
                      <button type="button" className="pwd-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Login Options: Remember Me & Forgot Password */}
                {authMode === 'login' && (
                  <div className="auth-options">
                    <label className="remember-me">
                      <input type="checkbox" /> Remember me
                    </label>
                    <a href="#" className="forgot-pwd" onClick={(e) => { e.preventDefault(); showToast("Reset link sent to your email.", "success"); }}>Forgot Password?</a>
                  </div>
                )}

                {/* Submit Button */}
                <button type="submit" className="auth-submit-btn" disabled={authSubmitting}>
                  {authSubmitting ? (authMode === 'login' ? 'Signing In...' : authMode === 'verify-otp' ? 'Verifying...' : 'Creating Account...') : (authMode === 'login' ? 'Sign In' : authMode === 'verify-otp' ? 'Verify Code' : 'Create Account')}
                </button>

                {authMode === 'verify-otp' && (
                  <button
                    type="button"
                    className="auth-submit-btn"
                    style={{ marginTop: '0.75rem', background: 'transparent', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}
                    onClick={handleResendOtp}
                  >
                    Resend Code
                  </button>
                )}
                
              </form>

              <div className="auth-divider">or continue with</div>

              {/* Social Login Options */}
              <div className="social-login-grid">
              </div>

              {/* Continue as Guest */}
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false);
                    setAuthPortalIsGate(false);
                    setAuthMode('login');
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  <i className="fa-solid fa-arrow-right" style={{ marginRight: '8px' }}></i>
                  Continue as Guest
                </button>
              </div>

            </div>
          </div>
        </div>,
        document.body
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
          <a href="#" className="logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/sri-tech-logo-final.png" alt="SriTech Logo" style={{ height: '110px', width: 'auto', objectFit: 'contain', background: 'transparent', padding: 0, border: 'none', boxShadow: 'none' }} />
          </a>

          {/* 1. Search Box */}
          <div className="search-container" ref={searchContainerRef}>
            <input 
              type="text" 
              id="searchInput" 
              className="search-input" 
              placeholder="Search for products, categories and more" 
              value={searchTerm}
              onChange={(e) => {
                const nextValue = e.target.value;
                setSearchTerm(nextValue);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="fa-solid fa-magnifying-glass search-icon-inside" onClick={() => {
                const input = document.getElementById('searchInput');
                if (input) input.focus();
                setShowSuggestions(true);
              }}></i>
            </div>
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
                          <img loading="lazy" src={prod.images[0]} alt={prod.name} />
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

          <div className={`header-actions ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <a href="#home" className="action-btn" onClick={(e) => { setIsMobileMenuOpen(false); scrollToSection(e, 'home'); }} style={{ textDecoration: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>
              Home
            </a>

            <a href="#footer" className="action-btn" onClick={(e) => { setIsMobileMenuOpen(false); e.preventDefault(); const footer = document.getElementById('footer'); if (footer) footer.scrollIntoView({ behavior: 'smooth' }); }} style={{ textDecoration: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>
              Contact
            </a>

            <button className="action-btn" title="Wishlist" aria-label="View wishlist" onClick={() => setShowWishlist(true)}>
              <i className={waitlist.length > 0 ? "fa-solid fa-heart" : "fa-regular fa-heart"} aria-hidden="true" style={waitlist.length > 0 ? {color: 'var(--accent-yellow)'} : {}}></i>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Wishlist</span>
            </button>

            <button className="action-btn cart-btn" title="Cart" aria-label={`View shopping cart with ${cart.length} items`} onClick={() => setShowCart(true)}>
              <i className="fa-solid fa-cart-shopping" aria-hidden="true"></i>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Cart</span>
              {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
            </button>

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
                    if (isUserLoggedIn) return;
                    setAuthMode('login'); 
                    setShowAuthModal(true); 
                    setUserCredentials({ name: '', email: '', password: '' });
                  }}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Premium Dark Parallax Hero Section */}
        <section id="home" className="premium-hero">

          <div className="premium-hero-content">
            <div className="hero-text-content">
              <div className="hero-badge-wrap">
                <span className="premium-badge-text">COOK SMART. SAVE FUEL. SAVE NATURE.</span>
              </div>
              <h1>Efficient Cooking.<br/><span className="text-highlight-green">Better Future.</span></h1>
              <p className="hero-subtitle">Rocket stoves use less fuel, produce less smoke, and deliver higher efficiency for a sustainable tomorrow.</p>
              
              <div className="hero-features-row">
                <div className="feature-item-col">
                  <i className="fa-solid fa-fire-leaf"></i>
                  <div>
                    <strong>Up to 80%</strong>
                    <span>Less Fuel</span>
                  </div>
                </div>
                <div className="feature-item-col">
                  <i className="fa-solid fa-cloud-slash"></i>
                  <div>
                    <strong>Low Smoke</strong>
                    <span>Clean Cooking</span>
                  </div>
                </div>
                <div className="feature-item-col">
                  <i className="fa-solid fa-bolt"></i>
                  <div>
                    <strong>High Efficiency</strong>
                    <span>Better Performance</span>
                  </div>
                </div>
                <div className="feature-item-col">
                  <i className="fa-solid fa-tree"></i>
                  <div>
                    <strong>Eco Friendly</strong>
                    <span>Sustainable Living</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-cta-group hero-cta-center">
              <a href="#product" className="primary-btn-green" onClick={(e) => scrollToSection(e, 'product')}>Explore Products <i className="fa-solid fa-arrow-right"></i></a>
              <a href="#how-it-works" className="secondary-btn-outline" onClick={(e) => scrollToSection(e, 'how-it-works')}>Learn More <i className="fa-solid fa-play-circle"></i></a>
            </div>

            <div className="hero-image-wrapper">
              <div className="circular-badge">
                <svg viewBox="0 0 100 100">
                  <path id="curve" d="M 50 50 m -37 0 a 37 37 0 1 1 74 0 a 37 37 0 1 1 -74 0" fill="transparent" />
                  <text><textPath href="#curve" startOffset="0">COOK FASTER • SAVE MORE • LIVE BETTER • </textPath></text>
                </svg>
                <i className="fa-solid fa-leaf center-icon" style={{color: '#1E7A3B'}}></i>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Stats Bar */}
        <div className="stats-bar-wrapper">
          <div className="stats-bar-green">
            <div className="stat-item-row">
              <i className="fa-solid fa-piggy-bank stat-icon"></i>
              <div className="stat-text">
                <h3>80%</h3>
                <p>Less Fuel Consumption</p>
              </div>
            </div>
            <div className="stat-divider-light"></div>
            <div className="stat-item-row">
              <i className="fa-solid fa-cloud stat-icon"></i>
              <div className="stat-text">
                <h3>90%</h3>
                <p>Less Smoke Emission</p>
              </div>
            </div>
            <div className="stat-divider-light"></div>
            <div className="stat-item-row">
              <i className="fa-solid fa-fire stat-icon"></i>
              <div className="stat-text">
                <h3>2x</h3>
                <p>More Efficiency</p>
              </div>
            </div>
            <div className="stat-divider-light"></div>
            <div className="stat-item-row">
              <i className="fa-solid fa-leaf stat-icon"></i>
              <div className="stat-text">
                <h3>100%</h3>
                <p>Eco Friendly</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section id="how-it-works" className="how-it-works-section">
          <div className="hiw-container">
            <div className="section-header-dark">
              <h2>Master the Elements</h2>
              <p>The science of perfect combustion inside every Sri Tech stove.</p>
            </div>
            
            <div className="hiw-grid">
              <div className="hiw-illustration">
                <div className="cutaway-diagram">
                  <img src="/rocket-stove.png" alt="Stove Cutaway Diagram" className="cutaway-img" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; }} />
                  <div className="airflow-animated"></div>
                </div>
              </div>
              <div className="hiw-steps">
                <div className="step-card">
                  <div className="step-number">01</div>
                  <div className="step-info">
                    <h4>Feed Wood</h4>
                    <p>Load biomass or wood easily from the top or side intake port.</p>
                  </div>
                </div>
                <div className="step-card">
                  <div className="step-number">02</div>
                  <div className="step-info">
                    <h4>Airflow Ignites</h4>
                    <p>Oxygen is rapidly pulled through the bottom draft, creating a powerful draft.</p>
                  </div>
                </div>
                <div className="step-card">
                  <div className="step-number">03</div>
                  <div className="step-info">
                    <h4>Heat Rises</h4>
                    <p>The insulated combustion chamber forces fire up, burning excess smoke gases.</p>
                  </div>
                </div>
                <div className="step-card">
                  <div className="step-number">04</div>
                  <div className="step-info">
                    <h4>Efficient Cooking</h4>
                    <p>Concentrated high-velocity heat hits the cooking surface directly.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section id="why-choose-us" className="benefits-section">
          <div className="section-header-light">
            <h2>Better for You. Better for Nature.</h2>
            <p>Designed to outlast the harshest environments while protecting the planet.</p>
          </div>
          
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon"><i className="fa-solid fa-heart-pulse"></i></div>
              <h4>Healthier Cooking</h4>
              <p>Significantly reduces toxic smoke inhalation compared to traditional fires.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><i className="fa-solid fa-piggy-bank"></i></div>
              <h4>Saves Money</h4>
              <p>Uses up to 80% less fuel, paying for itself in a matter of months.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><i className="fa-solid fa-leaf"></i></div>
              <h4>Environment Friendly</h4>
              <p>Lower carbon footprint and reduced deforestation through massive efficiency.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><i className="fa-solid fa-hammer"></i></div>
              <h4>Durable & Long Lasting</h4>
              <p>Industrial-grade materials built for intense continuous heat.</p>
            </div>
          </div>
        </section>

        {/* Product Section */}
        <section id="product" className="products-section">
          <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', borderBottom: 'none', marginBottom: '2.5rem' }}>
            <h2 style={{ 
              fontFamily: "'Syne', 'Inter', sans-serif", 
              letterSpacing: '2px', 
              fontWeight: 800, 
              fontSize: '3.6rem', 
              textTransform: 'uppercase', 
              background: 'linear-gradient(135deg, var(--accent-yellow) 0%, #4ade80 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              textShadow: '0 4px 20px rgba(74, 222, 128, 0.15)'
            }}>
              PRODUCTS
            </h2>
          </div>

          <div className="category-bar-wrapper" style={{ marginBottom: '2rem' }}>
            <div className="category-bar-container">
              {categoryItems.map(cat => {
                const slug = getCategorySlug(cat);
                const displayName = getCategoryDisplayName(cat);
                let iconClass = 'fa-boxes-stacked';
                if (slug.includes('stove')) iconClass = 'fa-fire';
                else if (slug.includes('appliances')) iconClass = 'fa-home';
                else if (slug.includes('welding')) iconClass = 'fa-bolt';
                else if (slug.includes('engraining') || slug.includes('engraver')) iconClass = 'fa-gears';

                const buttonKey = slug || displayName;
                return (
                  <button 
                    key={buttonKey}
                    className={`category-bar-item ${selectedCategory === slug ? 'active' : ''}`}
                    onClick={() => {
                      handleCategoryChange(slug);
                      const el = document.getElementById('product');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <i className={`fa-solid ${iconClass}`}></i>
                    <span>{displayName}</span>
                  </button>
                );
              })}
            </div>
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


        {/* Testimonials Section */}
        <section className="testimonials-section">
          <div className="section-header-dark">
            <h2>Trusted by Professionals</h2>
            <p>See what our early adopters are saying about the Sri Tech difference.</p>
          </div>
          
          <div className="testimonials-grid">
            <div className="testimonial-card glass-panel">
              <div className="stars"><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i></div>
              <p className="review-text">"The heat output is incredible. We use 80% less wood than our traditional open fire setup. Truly a game changer for our catering business."</p>
              <div className="reviewer">
                <div className="reviewer-avatar">RA</div>
                <div>
                  <h4>Rajesh A.</h4>
                  <p>Commercial Caterer</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card glass-panel">
              <div className="stars"><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i></div>
              <p className="review-text">"Zero smoke once it gets going. It's built like a tank and the stainless steel finish looks premium in our outdoor kitchen."</p>
              <div className="reviewer">
                <div className="reviewer-avatar">SM</div>
                <div>
                  <h4>Sarah M.</h4>
                  <p>Eco-Resort Owner</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card glass-panel">
              <div className="stars"><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star-half-stroke"></i></div>
              <p className="review-text">"I was skeptical about the fuel savings, but the airflow design is pure genius. Boiling water takes a fraction of the time now."</p>
              <div className="reviewer">
                <div className="reviewer-avatar">KV</div>
                <div>
                  <h4>Karthik V.</h4>
                  <p>Homestead Enthusiast</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer id="footer" className="footer">
        <div className="footer-container">
          <div className="footer-details">
            <a href="#" className="footer-logo">The Sri Tech</a>
            <p>11/1, Gurusamipalayam, Rasipuram, Tamil Nadu 637403</p>
            <p>sritechoffical8@gmail.com</p>
            <p>+91 9043340278</p>
            <div className="social-links">
              <a href="https://www.instagram.com/thesritech?utm_source=qr&igsh=MWx6b2F5cGV5cXk4eA==" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram" aria-hidden="true"></i></a>
              <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook" aria-hidden="true"></i></a>
              <a href="#" aria-label="Youtube"><i className="fa-brands fa-youtube" aria-hidden="true"></i></a>
            </div>
          </div>

          <div className="footer-links">
            <h3>Quick Links</h3>
            <a href="#home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a>
            <a href="#product" onClick={(e) => { e.preventDefault(); const el = document.getElementById('product'); if(el) el.scrollIntoView({ behavior: 'smooth' }); }}>Products</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowComplaintModal(true); }}>Raise a Complaint</a>
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
