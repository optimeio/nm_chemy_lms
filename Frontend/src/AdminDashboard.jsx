import React, { useState, useEffect } from 'react';
import './index.css';

const AdminDashboard = ({ 
  onLogout, 
  products, 
  onAddProduct, 
  onDeleteProduct,
  onUpdateProduct,
  offerData, 
  onUpdateOffer, 
  categories, 
  onAddCategory,
  onAddCoupon,
  onDeleteCoupon,
  onUpdateCoupon,
  orders = [],
  coupons = [],
  supportQueries = [],
  activityLogs = [],
  leads = [],
  users = [],
  onToggleBlockUser,
  onDeleteUser,
  onRefresh,
  isRefreshing,
  heroBanners = [],
  onAddHeroBanner,
  onDeleteHeroBanner,
  onRespondToSupport
}) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [offerForm, setOfferForm] = useState(offerData);
  const [newHeroBanner, setNewHeroBanner] = useState({ image: '', caption: '' });
  const [supportReplies, setSupportReplies] = useState({});
  
  useEffect(() => {
    setOfferForm(offerData);
  }, [offerData]);

  const [newCategory, setNewCategory] = useState('');
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: '',
    linkedProduct: '',
    expiryDate: ''
  });
  
  const [editingCouponId, setEditingCouponId] = useState(null);

  const formatExipryDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const startEditCoupon = (coupon) => {
    setEditingCouponId(coupon._id || coupon.id);
    setNewCoupon({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      linkedProduct: coupon.linkedProduct || '',
      expiryDate: formatExipryDate(coupon.expiryDate)
    });
  };

  const cancelEditCoupon = () => {
    setEditingCouponId(null);
    setNewCoupon({
      code: '',
      discountType: 'Percentage',
      discountValue: '',
      linkedProduct: '',
      expiryDate: ''
    });
  };

  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    category: categories[0] || 'engraining-products', 
    icon: 'fa-box',
    isNewArrival: false,
    images: [] 
  });

  // --- Edit Product State ---
  const [editingProductId, setEditingProductId] = useState(null);
  const [editProduct, setEditProduct] = useState({
    name: '', price: '', category: '', isNewArrival: false, images: []
  });

  const startEditProduct = (p) => {
    setEditingProductId(p._id || p.id);
    setEditProduct({
      name: p.name || '',
      price: p.price ? p.price.toString().replace(/[₹,]/g, '') : '',
      category: p.category || (categories[0] || ''),
      isNewArrival: p.isNewArrival || false,
      images: p.images || []
    });
    // Scroll to top of products section
    setTimeout(() => document.getElementById('edit-product-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setEditProduct({ name: '', price: '', category: '', isNewArrival: false, images: [] });
  };

  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + editProduct.images.length > 5) {
      alert('Maximum 5 images allowed per product.');
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProduct(prev => ({ ...prev, images: [...prev.images, reader.result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEditImage = (index) => {
    setEditProduct(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    await onUpdateProduct(editingProductId, editProduct);
    cancelEditProduct();
  };

  const handleDelete = (productId) => {
    onDeleteProduct(productId);
  };

  const menuItems = [
    { name: 'Overview', icon: 'fa-chart-line' },
    { name: 'Offers', icon: 'fa-bullhorn' },
    { name: 'Hero Banners', icon: 'fa-images' },
    { name: 'All Products', icon: 'fa-boxes-stacked' },
    { name: 'Categories', icon: 'fa-list-ul' },
    { name: 'Inventory', icon: 'fa-warehouse' },
    { name: 'Customers', icon: 'fa-users' },
    { name: 'Orders', icon: 'fa-cart-shopping' },
    { name: 'Coupons', icon: 'fa-ticket' },
    { name: 'Support', icon: 'fa-headset' },
    { name: 'Activity Logs', icon: 'fa-clock-rotate-left' },
  ];

  const handleAddProduct = (e) => {
    e.preventDefault();
    onAddProduct(newProduct);
    alert('Product added successfully!');
    setNewProduct({ name: '', price: '', category: categories[0] || 'engraining-products', icon: 'fa-box', isNewArrival: false, images: [] });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newProduct.images.length > 5) {
      alert('Maximum 5 images allowed per product.');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const updatedImages = newProduct.images.filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, images: updatedImages });
  };

  const handleUpdateOffer = (e) => {
    e.preventDefault();
    onUpdateOffer(offerForm);
    alert('Offer updated successfully!');
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOfferForm({ ...offerForm, poster: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const slug = newCategory.toLowerCase().trim().replace(/\s+/g, '-');
    if (categories.includes(slug)) {
      alert('Category already exists!');
      return;
    }
    onAddCategory(slug);
    setNewCategory('');
    alert('Category added successfully!');
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountValue || !newCoupon.expiryDate) {
      alert('Please fill out all required coupon fields.');
      return;
    }
    
    const couponData = {
      code: newCoupon.code,
      discountType: newCoupon.discountType,
      discountValue: Number(newCoupon.discountValue),
      linkedProduct: newCoupon.linkedProduct || null,
      expiryDate: newCoupon.expiryDate
    };

    if (editingCouponId) {
      onUpdateCoupon(editingCouponId, couponData);
      setEditingCouponId(null);
    } else {
      onAddCoupon(couponData);
    }

    setNewCoupon({
      code: '',
      discountType: 'Percentage',
      discountValue: '',
      linkedProduct: '',
      expiryDate: ''
    });
  };

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    if (typeof priceStr === 'number') return priceStr;
    const cleaned = priceStr.toString().replace(/[₹$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <i className="fa-solid fa-gauge-high"></i>
          SRITECH <span>ADMIN</span>
        </div>
        <nav className="admin-nav-menu">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`admin-nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <button className="admin-logout-btn" onClick={onLogout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <h1>
            {activeTab} 
            <span style={{ marginLeft: '1rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
              <span className="status-pulse-dot"></span> System Live
            </span>
          </h1>
          <div className="admin-profile">
            <button 
              className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`} 
              onClick={onRefresh}
              title="Refresh Data"
            >
              <i className="fa-solid fa-arrows-rotate"></i> Refresh
            </button>
            <button className="admin-btn header-logout" onClick={onLogout} style={{ padding: '0.5rem 1rem' }}>
              <i className="fa-solid fa-right-from-bracket"></i> Logout
            </button>
            <div style={{ width: '1.5px', height: '24px', background: 'rgba(0,0,0,0.08)', margin: '0 0.5rem' }}></div>
            <div className="admin-info">
              <span className="admin-name">Sankarganesh R</span>
              <span className="admin-role">CEO & Super Admin</span>
            </div>
            <div className="admin-avatar">
              <img src="/logo.png" alt="SriTech Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </header>

        {/* Content Section */}
        <section className="admin-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Stats for Overview at the Top */}
          {activeTab === 'Overview' && (
            <div className="admin-stats-grid">
              <div className="stat-card">
                <span className="stat-label">Orders <i className="fa-solid fa-cart-shopping"></i></span>
                <span className="stat-value">{orders.length}</span>
                <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden', margin: '4px 0' }}>
                  <div style={{ width: orders.length > 0 ? '65%' : '0%', height: '100%', background: 'linear-gradient(90deg, #4f46e5, #06b6d4)', borderRadius: '2px' }}></div>
                </div>
                <span className="stat-change">{orders.length > 0 ? 'Active store orders' : 'No orders yet'}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Products <i className="fa-solid fa-boxes-stacked"></i></span>
                <span className="stat-value">{products.length}</span>
                <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden', margin: '4px 0' }}>
                  <div style={{ width: products.length > 0 ? '80%' : '0%', height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '2px' }}></div>
                </div>
                <span className="stat-change">Active item listings</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Queries <i className="fa-solid fa-headset"></i></span>
                <span className="stat-value">{supportQueries.length}</span>
                <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden', margin: '4px 0' }}>
                  <div style={{ width: supportQueries.length > 0 ? '40%' : '0%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: '2px' }}></div>
                </div>
                <span className="stat-change">{supportQueries.filter(q => q.status === 'Open').length} pending queries</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Coupons <i className="fa-solid fa-ticket"></i></span>
                <span className="stat-value">{coupons.length}</span>
                <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden', margin: '4px 0' }}>
                  <div style={{ width: coupons.length > 0 ? '50%' : '0%', height: '100%', background: 'linear-gradient(90deg, #ec4899, #f43f5e)', borderRadius: '2px' }}></div>
                </div>
                <span className="stat-change">Active discount codes</span>
              </div>
            </div>
          )}

          {activeTab === 'Overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
              {/* Sales Summary visual block */}
              <div className="admin-card-glass">
                <h3>Store Performance Overview</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span>Product Sales Target Completion</span>
                      <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>78% Completed</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, #4f46e5, #818cf8)', borderRadius: '6px' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span>Order Fulfillment Rate</span>
                      <span style={{ fontWeight: 'bold', color: '#10b981' }}>92% Dispatched</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '6px' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span>System Resource Health</span>
                      <span style={{ fontWeight: 'bold', color: '#0284c7' }}>Optimal (99.8% Uptime)</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: '99%', height: '100%', background: 'linear-gradient(90deg, #0284c7, #38bdf8)', borderRadius: '6px' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="admin-card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3>Quick Management</h3>
                <button className="admin-btn admin-btn-primary" onClick={() => setActiveTab('All Products')} style={{ justifyContent: 'center' }}>
                  <i className="fa-solid fa-plus"></i> Add New Product
                </button>
                <button className="admin-btn admin-btn-primary" onClick={() => setActiveTab('Offers')} style={{ justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}>
                  <i className="fa-solid fa-bullhorn"></i> Update Banners
                </button>
                <button className="admin-btn admin-btn-primary" onClick={() => setActiveTab('Categories')} style={{ justifyContent: 'center', background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
                  <i className="fa-solid fa-list-ul"></i> Edit Categories
                </button>
              </div>
            </div>
          )}

          {activeTab === 'All Products' && (
            <div className="admin-products-management">
              {/* Edit Product Panel */}
              {editingProductId && (
                <div id="edit-product-panel" className="admin-card-glass" style={{ border: '2px solid var(--primary-color)', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ color: 'var(--primary-dark)', margin: 0 }}>
                      <i className="fa-solid fa-pen-to-square" style={{ marginRight: '8px' }}></i>
                      Edit Product
                    </h3>
                    <button
                      type="button"
                      onClick={cancelEditProduct}
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', borderRadius: '8px', padding: '0.4rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      <i className="fa-solid fa-xmark" style={{ marginRight: '5px' }}></i>Cancel
                    </button>
                  </div>
                  <form onSubmit={handleUpdateProduct}>
                    <div className="admin-form-grid" style={{ marginBottom: '1.25rem' }}>
                      <div className="admin-form-group">
                        <label>Product Name</label>
                        <input
                          type="text"
                          placeholder="Product name"
                          required
                          value={editProduct.name}
                          onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Price (₹)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <span style={{ position: 'absolute', left: '1rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>₹</span>
                          <input
                            type="text"
                            placeholder="e.g. 1499"
                            required
                            maxLength="6"
                            value={editProduct.price}
                            onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                            style={{ paddingLeft: '2rem', width: '100%' }}
                          />
                        </div>
                      </div>
                      <div className="admin-form-group">
                        <label>Category</label>
                        <select
                          value={editProduct.category}
                          onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>
                              {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="admin-form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '1.8rem' }}>
                        <input
                          type="checkbox"
                          id="editNewArrival"
                          checked={editProduct.isNewArrival}
                          onChange={(e) => setEditProduct({ ...editProduct, isNewArrival: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="editNewArrival" style={{ cursor: 'pointer' }}>Mark as New Arrival</label>
                      </div>
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: '1.5rem' }}>
                      <label>Product Images (Max 5)</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                        {editProduct.images.map((src, index) => (
                          <div key={index} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--primary-light)' }}>
                            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={() => removeEditImage(index)}
                              style={{ position: 'absolute', top: '2px', right: '2px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                        {editProduct.images.length < 5 && (
                          <label style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px dashed var(--primary-light)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                            <i className="fa-solid fa-plus" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}></i>
                            <span style={{ fontSize: '0.65rem', color: 'var(--primary-color)', marginTop: '4px' }}>Add Image</span>
                            <input type="file" accept="image/*" multiple onChange={handleEditFileChange} style={{ display: 'none' }} />
                          </label>
                        )}
                      </div>
                    </div>

                    <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
                      <i className="fa-solid fa-floppy-disk" style={{ marginRight: '6px' }}></i>
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              <div className="admin-card-glass">
                <h3>Add New Product</h3>
                <form onSubmit={handleAddProduct}>
                  <div className="admin-form-grid" style={{ marginBottom: '1.25rem' }}>
                    <div className="admin-form-group">
                      <label>Product Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Sustainable Rocket Stove" 
                        required 
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Price (₹)</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: '1rem', color: '#818cf8', fontWeight: 'bold' }}>₹</span>
                        <input 
                          type="text" 
                          placeholder="e.g. 1499" 
                          required 
                          maxLength="6"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                          style={{ paddingLeft: '2rem', width: '100%' }}
                        />
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label>Category</label>
                      <select 
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>
                            {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '1.8rem' }}>
                      <input 
                        type="checkbox" 
                        id="newArrival" 
                        checked={newProduct.isNewArrival}
                        onChange={(e) => setNewProduct({...newProduct, isNewArrival: e.target.checked})}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="newArrival" style={{ cursor: 'pointer' }}>Mark as New Arrival</label>
                    </div>
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Product Images (Upload - Max 5)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                      {newProduct.images.map((base64, index) => (
                        <div key={index} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #818cf8' }}>
                          <img src={base64} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button" 
                            onClick={() => removeImage(index)}
                            style={{ position: 'absolute', top: '2px', right: '2px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                      {newProduct.images.length < 5 && (
                        <label style={{ 
                          width: '80px', height: '80px', borderRadius: '8px', border: '2px dashed rgba(0,0,0,0.1)', 
                          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
                          cursor: 'pointer', transition: 'var(--transition)' 
                        }} className="upload-btn">
                          <i className="fa-solid fa-plus" style={{ color: '#64748b', fontSize: '1.2rem' }}></i>
                          <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>Add Image</span>
                          <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>
                      )}
                    </div>
                  </div>

                  <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
                    Add Product to Catalog
                  </button>
                </form>
              </div>

              <div className="admin-card-glass">
                <h3>Current Inventory ({products.length} products)</h3>
                {products.length > 0 ? (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Preview</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p._id || p.id} style={editingProductId === (p._id || p.id) ? { background: 'rgba(22,163,74,0.06)' } : {}}>
                            <td>
                              <div className="table-img-circle">
                                {p.images && p.images.length > 0 ? (
                                  <img src={p.images[0]} alt={p.name} />
                                ) : (
                                  <i className={`fa-solid ${p.icon || 'fa-box'}`} style={{ color: 'var(--primary-color)' }}></i>
                                )}
                              </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{p.name}</td>
                            <td>{(p.category || '').replace(/-/g, ' ')}</td>
                            <td style={{ fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                              {p.price.toString().startsWith('₹') ? p.price : `₹${p.price}`}
                            </td>
                            <td>
                              {p.isNewArrival ? (
                                <span className="status-pill active">New Arrival</span>
                              ) : (
                                <span className="status-pill" style={{ color: '#94a3b8', background: 'rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>Standard</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                  className="admin-btn admin-btn-success"
                                  onClick={() => startEditProduct(p)}
                                  title="Edit Product"
                                  style={editingProductId === (p._id || p.id) ? { background: 'var(--primary-color)', color: 'white', borderColor: 'var(--primary-color)' } : {}}
                                >
                                  <i className="fa-solid fa-pen"></i> Edit
                                </button>
                                <button
                                  className="admin-btn admin-btn-danger"
                                  onClick={() => handleDelete(p._id || p.id)}
                                  title="Delete Product"
                                >
                                  <i className="fa-solid fa-trash"></i> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="admin-empty-state">No products in inventory yet.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Categories' && (
            <div className="admin-categories-management">
              <div className="admin-card-glass">
                <h3>Add New Category</h3>
                <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label>Category Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Electronics & Gadgets" 
                      required 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="admin-btn admin-btn-primary" style={{ height: '44px', marginBottom: '2px' }}>
                    Add Category
                  </button>
                </form>
              </div>

              <div className="admin-card-glass">
                <h3>Existing Categories</h3>
                <div className="admin-category-grid">
                  {categories.map(cat => (
                    <div key={cat._id} className="admin-category-card">
                      <span>{cat.name}</span>
                      <i className="fa-solid fa-tag"></i>
                      <button className="admin-btn admin-btn-small" onClick={() => onUpdateCategory(cat._id, prompt('New name', cat.name) || cat.name)} title="Edit Category"><i className="fa-solid fa-pen"></i></button>
                      <button className="admin-btn admin-btn-small" onClick={() => onDeleteCategory(cat._id)} title="Delete Category"><i className="fa-solid fa-trash"></i></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Offers' && (
            <div className="admin-offers-management">
              <div className="admin-card-glass">
                <h3>Manage Storefront Promotion Banner</h3>
                <p style={{ marginBottom: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>Configure the promotional discount banner displayed at the top of the main catalog pages.</p>
                
                <form onSubmit={handleUpdateOffer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="admin-form-group">
                      <label>Offer Title</label>
                      <input 
                        type="text" 
                        value={offerForm.title}
                        onChange={(e) => setOfferForm({...offerForm, title: e.target.value})}
                        placeholder="e.g. Grand Monsoon Sale!"
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Description</label>
                      <textarea 
                        value={offerForm.description}
                        onChange={(e) => setOfferForm({...offerForm, description: e.target.value})}
                        placeholder="Describe the offer details..."
                        style={{ minHeight: '80px' }}
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Promo Voucher Code</label>
                      <input 
                        type="text" 
                        value={offerForm.code}
                        onChange={(e) => setOfferForm({...offerForm, code: e.target.value})}
                        placeholder="e.g. MONSOON30"
                        required
                      />
                    </div>
                    <button type="submit" className="admin-btn admin-btn-primary" style={{ justifyContent: 'center' }}>
                      Update Promo Banner
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Banner Poster Image</label>
                    <div style={{ 
                      width: '100%', height: '220px', border: '2px dashed rgba(0,0,0,0.1)', 
                      borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', 
                      alignItems: 'center', overflow: 'hidden', position: 'relative', background: '#f8fafc' 
                    }}>
                      {offerForm.poster ? (
                        <>
                          <img src={offerForm.poster} alt="Poster Banner" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          <button 
                            type="button" 
                            onClick={() => setOfferForm({...offerForm, poster: null})}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            &times;
                          </button>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                          <i className="fa-solid fa-image" style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '0.5rem' }}></i>
                          <p style={{ color: '#64748b', fontSize: '0.8rem' }}>No poster uploaded</p>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      id="posterInput" 
                      accept="image/*" 
                      onChange={handlePosterChange} 
                      style={{ display: 'none' }} 
                    />
                    <label 
                      htmlFor="posterInput" 
                      className="admin-btn" 
                      style={{ 
                        justifyContent: 'center', background: '#ffffff', 
                        border: '1px solid #cbd5e1', color: '#334155', cursor: 'pointer' 
                      }}
                    >
                      {offerForm.poster ? 'Change Banner Image' : 'Upload Banner Image'}
                    </label>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'Orders' && (
            <div className="admin-orders-management">
              <div className="admin-card-glass">
                <h3>Recent Orders</h3>
                {orders.length > 0 ? (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o._id || o.id}>
                            <td style={{ fontWeight: '700', color: '#818cf8' }}>#{o.orderId}</td>
                            <td>{o.customerName}</td>
                            <td style={{ fontWeight: 'bold', color: 'white' }}>
                              {o.totalAmount?.toString().startsWith('₹') ? o.totalAmount : `₹${o.totalAmount}`}
                            </td>
                            <td>
                              <span className={`status-pill ${o.status === 'Delivered' ? 'delivered' : 'processing'}`}>
                                {o.status}
                              </span>
                            </td>
                            <td style={{ color: '#94a3b8' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="admin-empty-state">No orders placed yet.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Coupons' && (
            <div className="admin-coupons-management" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
              <div className="admin-card-glass">
                <h3>{editingCouponId ? 'Edit Coupon' : 'Add New Coupon'}</h3>
                <form onSubmit={handleCreateCoupon}>
                  <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                    <label>Coupon Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. STOVE15" 
                      required 
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase().trim()})}
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                    <label>Discount Type</label>
                    <select 
                      value={newCoupon.discountType}
                      onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value})}
                    >
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                    <label>Discount Value</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 15" 
                      required 
                      min="1"
                      value={newCoupon.discountValue}
                      onChange={(e) => setNewCoupon({...newCoupon, discountValue: e.target.value})}
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                    <label>Linked Product</label>
                    <select 
                      value={newCoupon.linkedProduct}
                      onChange={(e) => setNewCoupon({...newCoupon, linkedProduct: e.target.value})}
                    >
                      <option value="">None / Apply to None (Manual Only)</option>
                      {products.map(p => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Expiry Date</label>
                    <input 
                      type="date" 
                      required 
                      value={newCoupon.expiryDate}
                      onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                    />
                  </div>
                  {editingCouponId ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="admin-btn admin-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                        Update Coupon
                      </button>
                      <button type="button" onClick={cancelEditCoupon} className="admin-btn" style={{ flex: 1, justifyContent: 'center', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Create Coupon Code
                    </button>
                  )}
                </form>
              </div>

              <div className="admin-card-glass">
                <h3>Active Store Coupons</h3>
                {coupons.length > 0 ? (
                  <div className="admin-coupon-grid">
                    {coupons.map(c => {
                      const linkedProd = products.find(p => (p._id || p.id) === c.linkedProduct);
                      return (
                        <div key={c._id || c.code} className="admin-coupon-card">
                          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => startEditCoupon(c)} 
                              title="Edit Coupon"
                              style={{ border: 'none', background: '#eff6ff', color: '#1d4ed8', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                            >
                              <i className="fa-solid fa-pen" style={{ fontSize: '0.75rem' }}></i>
                            </button>
                            <button 
                              onClick={() => onDeleteCoupon(c._id || c.id)} 
                              title="Delete Coupon"
                              style={{ border: 'none', background: '#fef2f2', color: '#dc2626', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                            >
                              <i className="fa-solid fa-trash" style={{ fontSize: '0.75rem' }}></i>
                            </button>
                          </div>
                          <h4>{c.code}</h4>
                          <div className="discount-val">
                            {c.discountValue}{c.discountType === 'Percentage' ? '%' : '₹'} OFF
                          </div>
                          {linkedProd && (
                            <div style={{ fontSize: '0.78rem', color: '#4f46e5', fontWeight: 600, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                              Linked: {linkedProd.name}
                            </div>
                          )}
                          <div className="expiry">
                            Expires: {new Date(c.expiryDate).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="admin-empty-state">No active discount coupon codes available.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Hero Banners' && (
            <div className="admin-banners-management" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
              <div className="admin-card-glass">
                <h3>Upload New Hero Banner</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newHeroBanner.image) {
                    alert('Please select an image first.');
                    return;
                  }
                  await onAddHeroBanner(newHeroBanner);
                  setNewHeroBanner({ image: '', caption: '' });
                }}>
                  <div className="admin-form-group" style={{ marginBottom: '1.25rem' }}>
                    <label>Caption / Text (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Premium Sustainable Engineering"
                      value={newHeroBanner.caption}
                      onChange={(e) => setNewHeroBanner({...newHeroBanner, caption: e.target.value})}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Banner Image</label>
                    <div style={{ 
                      width: '100%', height: '180px', border: '2px dashed rgba(0,0,0,0.1)', 
                      borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', 
                      alignItems: 'center', overflow: 'hidden', position: 'relative', background: '#f8fafc' 
                    }}>
                      {newHeroBanner.image ? (
                        <>
                          <img src={newHeroBanner.image} alt="New Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          <button 
                            type="button" 
                            onClick={() => setNewHeroBanner({...newHeroBanner, image: ''})}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            &times;
                          </button>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                          <i className="fa-solid fa-images" style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '0.5rem' }}></i>
                          <p style={{ color: '#64748b', fontSize: '0.8rem' }}>No image selected</p>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      id="heroImageInput" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewHeroBanner(prev => ({ ...prev, image: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      style={{ display: 'none' }} 
                    />
                    <label 
                      htmlFor="heroImageInput" 
                      className="admin-btn" 
                      style={{ 
                        justifyContent: 'center', background: '#ffffff', 
                        border: '1px solid #cbd5e1', color: '#334155', cursor: 'pointer' 
                      }}
                    >
                      {newHeroBanner.image ? 'Change Image' : 'Select Image'}
                    </label>
                  </div>
                  
                  <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <i className="fa-solid fa-cloud-arrow-up"></i> Upload Banner
                  </button>
                </form>
              </div>

              <div className="admin-card-glass">
                <h3>Current Hero Banners</h3>
                {heroBanners.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                    {heroBanners.map((banner) => (
                      <div 
                        key={banner._id || banner.id} 
                        className="admin-banner-card"
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          background: 'white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div style={{ height: '140px', background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
                          <img src={banner.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            onClick={() => onDeleteHeroBanner(banner._id || banner.id)}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              width: '28px',
                              height: '28px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            title="Delete Banner"
                          >
                            <i className="fa-solid fa-trash" style={{ fontSize: '0.8rem' }}></i>
                          </button>
                        </div>
                        {banner.caption && (
                          <div style={{ padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155', borderTop: '1px solid #f1f5f9' }}>
                            {banner.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-empty-state">No hero banners uploaded yet. Showing fallback image.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Support' && (
            <div className="admin-support-management">
              <div className="admin-card-glass">
                <h3>Customer Support Query Tickets</h3>
                {supportQueries.length > 0 ? (
                  <div className="admin-ticket-list">
                    {supportQueries.map(q => (
                      <div key={q._id || q.id} className="admin-ticket-card" style={{ border: (q.status === 'Resolved' || q.status === 'Responded') ? '1px solid #bbf7d0' : '1px solid #fef3c7' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '700', color: '#0f172a' }}>{q.subject}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(q.createdAt).toLocaleString()}</span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '1rem', lineHeight: '1.4' }}>{q.message}</p>
                        
                        {q.adminResponse && (
                          <div style={{ marginTop: '0.5rem', marginBottom: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#15803d', fontWeight: 'bold', marginBottom: '4px' }}>
                              <span><i className="fa-solid fa-reply"></i> Response Sent</span>
                              {q.respondedAt && <span>{new Date(q.respondedAt).toLocaleString()}</span>}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#14532d', margin: 0, whiteSpace: 'pre-line' }}>{q.adminResponse}</p>
                          </div>
                        )}

                        {q.status !== 'Resolved' && q.status !== 'Responded' && (
                          <div style={{ marginTop: '0.5rem', marginBottom: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                              <i className="fa-solid fa-reply"></i> Write Response to {q.customerName}
                            </label>
                            <textarea
                              placeholder="Type your response here..."
                              style={{ width: '100%', minHeight: '85px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', outline: 'none', resize: 'vertical', display: 'block', marginBottom: '8px' }}
                              value={supportReplies[q._id || q.id] || ''}
                              onChange={(e) => setSupportReplies({ ...supportReplies, [q._id || q.id]: e.target.value })}
                            />
                            <button
                              type="button"
                              className="admin-btn admin-btn-primary"
                              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                              onClick={async () => {
                                const responseText = supportReplies[q._id || q.id];
                                if (!responseText || !responseText.trim()) {
                                  alert('Please enter a response message.');
                                  return;
                                }
                                await onRespondToSupport(q._id || q.id, responseText);
                                setSupportReplies(prev => ({ ...prev, [q._id || q.id]: '' }));
                              }}
                            >
                              Send Response & Mark as Responded
                            </button>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Raised by: <strong style={{ color: '#0f172a' }}>{q.customerName}</strong> ({q.email})
                          </span>
                          <span className={`status-pill ${(q.status === 'Resolved' || q.status === 'Responded') ? 'active' : 'processing'}`}>
                            {q.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-empty-state">No support query tickets found.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Activity Logs' && (
            <div className="admin-logs-management">
              <div className="admin-card-glass">
                <h3>Administrative Activity Logs</h3>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {activityLogs.length > 0 ? activityLogs.map(l => (
                    <div key={l._id} className="admin-log-item">
                      <span>
                        <strong style={{ color: '#4f46e5' }}>{l.action}</strong>: <span style={{ color: '#334155' }}>{l.details}</span>
                      </span>
                      <span className="time">{new Date(l.timestamp).toLocaleString()}</span>
                    </div>
                  )) : (
                    <div className="admin-empty-state">No administrative activity logged yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Inventory' && (
            <div className="admin-inventory-management">
              <div className="admin-card-glass">
                <h3>Visitor Leads (WhatsApp Submissions)</h3>
                {leads.length > 0 ? (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>WhatsApp Link</th>
                          <th>Location</th>
                          <th>Date Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map(lead => (
                          <tr key={lead._id || lead.id}>
                            <td style={{ fontWeight: '600', color: '#0f172a' }}>{lead.name}</td>
                            <td>
                              <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <i className="fa-brands fa-whatsapp"></i> {lead.whatsapp}
                              </a>
                            </td>
                            <td>{lead.location}</td>
                            <td style={{ color: '#64748b' }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="admin-empty-state">No visitor leads found.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Customers' && (
            <div className="admin-customers-management">
              <div className="admin-card-glass">
                <h3>Registered User Directory</h3>
                {users.length > 0 ? (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Joined Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user._id || user.id}>
                            <td style={{ fontWeight: '600', color: '#0f172a' }}>{user.name}</td>
                            <td>{user.email}</td>
                            <td style={{ color: '#64748b' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-pill ${user.status === 'blocked' ? 'blocked' : 'active'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                  onClick={() => onToggleBlockUser(user._id || user.id)}
                                  className={`admin-btn ${user.status === 'blocked' ? 'admin-btn-success' : 'admin-btn-danger'}`}
                                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                >
                                  {user.status === 'blocked' ? 'Unblock' : 'Block'}
                                </button>
                                <button 
                                  onClick={() => onDeleteUser(user._id || user.id)}
                                  className="admin-btn admin-btn-danger"
                                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="admin-empty-state">No customers registered yet.</div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
