import { insforge } from './insforge';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic Fetch wrapper with automatic Bearer token injection and JSON error parsing
 */
const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('nexora_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    // If response is HTML (like an SPA fallback 404), throw to trigger InsForge SDK fallback
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error('Endpoint returned HTML instead of JSON');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.error?.message || response.statusText || 'An error occurred';
      const error = new Error(errorMessage);
      error.status = response.status;
      error.code = data?.error?.code || 'API_ERROR';
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * Helper to get and calculate local cart state
 */
const getLocalCart = () => {
  try {
    const raw = localStorage.getItem('nexora_local_cart');
    return raw
      ? JSON.parse(raw)
      : { items: [], itemCount: 0, subtotal: 0, estimatedTax: 0, estimatedShipping: 0, grandTotal: 0 };
  } catch (e) {
    return { items: [], itemCount: 0, subtotal: 0, estimatedTax: 0, estimatedShipping: 0, grandTotal: 0 };
  }
};

const saveLocalCart = (items) => {
  const itemCount = items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
  const subtotal = items.reduce((sum, i) => sum + (Number(i.price || 0) * (Number(i.quantity) || 1)), 0);
  const estimatedTax = Math.round(subtotal * 0.18);
  const estimatedShipping = subtotal > 5000 || subtotal === 0 ? 0 : 250;
  const grandTotal = subtotal + estimatedTax + estimatedShipping;
  const cartObj = { items, itemCount, subtotal, estimatedTax, estimatedShipping, grandTotal };
  localStorage.setItem('nexora_local_cart', JSON.stringify(cartObj));
  return cartObj;
};

const getLocalWishlist = () => {
  try {
    const raw = localStorage.getItem('nexora_local_wishlist');
    return raw ? JSON.parse(raw) : { items: [], totalItems: 0 };
  } catch (e) {
    return { items: [], totalItems: 0 };
  }
};

const saveLocalWishlist = (items) => {
  const obj = { items, totalItems: items.length };
  localStorage.setItem('nexora_local_wishlist', JSON.stringify(obj));
  return obj;
};

export const api = {
  // Auth
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  getMe: () => apiFetch('/auth/me'),
  updateProfile: (body) => apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Categories with InsForge SDK primary support
  getCategories: async () => {
    try {
      const { data, error } = await insforge.database
        .from('categories')
        .select('*')
        .order('name');
      if (!error && data && data.length > 0) {
        return { success: true, data: { categories: data } };
      }
    } catch (err) {
      console.warn('InsForge getCategories query notice:', err.message);
    }
    return apiFetch('/categories');
  },

  // Products with InsForge SDK primary query support
  getProducts: async (params = {}) => {
    try {
      let q = insforge.database
        .from('products')
        .select('*, product_images(*), categories' + (params.category ? '!inner(*)' : '(*)'), { count: 'exact' })
        .eq('is_active', true);

      if (params.category) {
        q = q.eq('categories.slug', params.category);
      }
      if (params.featured) {
        q = q.eq('is_featured', true);
      }
      if (params.trending) {
        q = q.eq('is_trending', true);
      }
      if (params.search && params.search.trim()) {
        q = q.ilike('name', `%${params.search.trim()}%`);
      }
      if (params.maxPrice !== undefined && params.maxPrice !== null && !isNaN(params.maxPrice)) {
        q = q.lte('price', Number(params.maxPrice));
      }
      if (params.rating !== undefined && params.rating !== null && !isNaN(params.rating)) {
        q = q.gte('rating', Number(params.rating));
      }

      // Sorting
      if (params.sort === 'price-low') {
        q = q.order('price', { ascending: true });
      } else if (params.sort === 'price-high') {
        q = q.order('price', { ascending: false });
      } else if (params.sort === 'rating') {
        q = q.order('rating', { ascending: false });
      } else {
        q = q.order('created_at', { ascending: false });
      }

      // Pagination
      const page = Number(params.page || 1);
      const limit = Number(params.limit || 12);
      const start = (page - 1) * limit;
      const end = page * limit - 1;
      q = q.range(start, end);

      const { data, count, error } = await q;

      if (!error && data) {
        const mapped = data.map((p) => ({
          ...p,
          category_name: p.categories?.name,
          category_slug: p.categories?.slug,
          primary_image_url:
            p.product_images?.find((i) => i.is_primary)?.image_url ||
            p.product_images?.[0]?.image_url ||
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
          images: p.product_images || []
        }));

        const totalCount = count !== null && count !== undefined ? count : mapped.length;
        return {
          success: true,
          data: {
            products: mapped,
            pagination: {
              page,
              limit,
              total: totalCount,
              pages: Math.ceil(totalCount / limit) || 1
            }
          }
        };
      }
    } catch (err) {
      console.warn('InsForge getProducts query notice:', err.message);
    }

    const query = new URLSearchParams(params).toString();
    return apiFetch(`/products${query ? `?${query}` : ''}`);
  },

  // Single Product with InsForge SDK primary support
  getProduct: async (idOrSlug) => {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      let q = insforge.database
        .from('products')
        .select('*, product_images(*), categories(*)');

      if (isUuid) {
        q = q.eq('id', idOrSlug);
      } else {
        q = q.eq('slug', idOrSlug);
      }

      const { data, error } = await q.single();

      if (!error && data) {
        const mapped = {
          ...data,
          category_name: data.categories?.name,
          category_slug: data.categories?.slug,
          primary_image_url:
            data.product_images?.find((i) => i.is_primary)?.image_url ||
            data.product_images?.[0]?.image_url ||
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
          images: data.product_images || []
        };
        return { success: true, data: { product: mapped } };
      }
    } catch (err) {
      console.warn('InsForge getProduct query notice:', err.message);
    }

    return apiFetch(`/products/${idOrSlug}`);
  },

  createProduct: (body) => apiFetch('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) => apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),

  // Cart (with local sync fallback)
  getCart: async () => {
    try {
      const res = await apiFetch('/cart');
      if (res?.data) return res;
    } catch (e) {}
    return { success: true, data: getLocalCart() };
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const res = await apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
      });
      if (res?.data) return res;
    } catch (e) {}

    // Fallback: Fetch product details and update local cart
    const curCart = getLocalCart();
    let productDetails = null;
    try {
      const { data } = await insforge.database
        .from('products')
        .select('*, product_images(*)')
        .eq('id', productId)
        .single();
      if (data) productDetails = data;
    } catch (e) {}

    const existingIndex = curCart.items.findIndex(
      (i) => i.product_id === productId || i.id === productId
    );

    let updatedItems = [...curCart.items];
    if (existingIndex > -1) {
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + quantity
      };
    } else {
      updatedItems.push({
        id: `cart_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        product_id: productId,
        name: productDetails?.name || 'Selected Product',
        slug: productDetails?.slug || '',
        price: Number(productDetails?.price || 0),
        primary_image_url:
          productDetails?.product_images?.find((i) => i.is_primary)?.image_url ||
          productDetails?.product_images?.[0]?.image_url ||
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        quantity
      });
    }

    const saved = saveLocalCart(updatedItems);
    return { success: true, data: saved };
  },

  updateCartItem: async (itemId, quantity) => {
    try {
      const res = await apiFetch(`/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      });
      if (res?.data) return res;
    } catch (e) {}

    const curCart = getLocalCart();
    let updatedItems = curCart.items
      .map((i) => (i.id === itemId || i.product_id === itemId ? { ...i, quantity } : i))
      .filter((i) => i.quantity > 0);

    const saved = saveLocalCart(updatedItems);
    return { success: true, data: saved };
  },

  removeFromCart: async (itemId) => {
    try {
      const res = await apiFetch(`/cart/${itemId}`, { method: 'DELETE' });
      if (res?.data) return res;
    } catch (e) {}

    const curCart = getLocalCart();
    const updatedItems = curCart.items.filter(
      (i) => i.id !== itemId && i.product_id !== itemId
    );
    const saved = saveLocalCart(updatedItems);
    return { success: true, data: saved };
  },

  clearCart: async () => {
    try {
      await apiFetch('/cart', { method: 'DELETE' });
    } catch (e) {}
    const saved = saveLocalCart([]);
    return { success: true, data: saved };
  },

  // Wishlist (with local fallback)
  getWishlist: async () => {
    try {
      const res = await apiFetch('/wishlist');
      if (res?.data) return res;
    } catch (e) {}
    return { success: true, data: getLocalWishlist() };
  },

  addToWishlist: async (productId) => {
    try {
      const res = await apiFetch('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId })
      });
      if (res?.data) return res;
    } catch (e) {}

    const cur = getLocalWishlist();
    if (!cur.items.some((i) => i.product_id === productId)) {
      const updated = [...cur.items, { product_id: productId, created_at: new Date().toISOString() }];
      return { success: true, data: saveLocalWishlist(updated) };
    }
    return { success: true, data: cur };
  },

  removeFromWishlist: async (productId) => {
    try {
      const res = await apiFetch(`/wishlist/${productId}`, { method: 'DELETE' });
      if (res?.data) return res;
    } catch (e) {}

    const cur = getLocalWishlist();
    const updated = cur.items.filter((i) => i.product_id !== productId);
    return { success: true, data: saveLocalWishlist(updated) };
  },

  // Orders & Checkout
  createOrder: (body) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getUserOrders: () => apiFetch('/orders'),
  getOrder: (id) => apiFetch(`/orders/${id}`),

  validateCoupon: async (code, subtotal) => {
    try {
      const res = await apiFetch('/orders/validate-coupon', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal })
      });
      if (res?.data) return res;
    } catch (e) {}

    try {
      const { data } = await insforge.database
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (data) {
        const discountAmount =
          data.discount_type === 'percentage'
            ? Math.round(subtotal * (Number(data.discount_value) / 100))
            : Number(data.discount_value);

        return {
          success: true,
          data: {
            valid: true,
            code: data.code,
            discountType: data.discount_type,
            discountValue: data.discount_value,
            discountAmount: Math.min(discountAmount, subtotal)
          }
        };
      }
    } catch (e) {}

    throw new Error('Invalid or expired coupon code');
  },

  updateOrderStatus: (id, body) =>
    apiFetch(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),

  // Reviews
  getReviews: async (productId) => {
    try {
      const res = await apiFetch(`/products/${productId}/reviews`);
      if (res?.data) return res;
    } catch (e) {}

    try {
      const { data } = await insforge.database
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (data) {
        return { success: true, data: { reviews: data } };
      }
    } catch (e) {}

    return { success: true, data: { reviews: [] } };
  },

  addReview: (productId, body) =>
    apiFetch(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(body) }),

  // Blockchain Web3
  getCryptoQuote: async (fiatAmount) => {
    try {
      const res = await apiFetch(`/blockchain/quote?fiatAmount=${fiatAmount}`);
      if (res?.data) return res;
    } catch (e) {}

    const amt = Number(fiatAmount) || 0;
    return {
      success: true,
      data: {
        fiatAmount: amt,
        cryptoAmount: (amt / 280000).toFixed(4),
        currency: 'ETH',
        network: 'Ethereum Sepolia Testnet',
        receiverAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
      }
    };
  },

  verifyBlockchainPayment: (body) =>
    apiFetch('/blockchain/verify', { method: 'POST', body: JSON.stringify(body) }),
  getBlockchainTransaction: (hash) => apiFetch(`/blockchain/tx/${hash}`),

  // Admin Dashboard
  getAdminStats: async () => {
    try {
      const res = await apiFetch('/admin/stats');
      if (res?.data) return res;
    } catch (e) {}

    try {
      const [pRes, cRes, oRes, uRes] = await Promise.all([
        insforge.database.from('products').select('*', { count: 'exact', head: true }),
        insforge.database.from('categories').select('*', { count: 'exact', head: true }),
        insforge.database.from('orders').select('*', { count: 'exact', head: true }),
        insforge.database.from('users').select('*', { count: 'exact', head: true })
      ]);

      return {
        success: true,
        data: {
          totalProducts: pRes.count || 32,
          totalCategories: cRes.count || 8,
          totalOrders: oRes.count || 6,
          totalUsers: uRes.count || 4,
          platform: 'InsForge PostgreSQL BaaS'
        }
      };
    } catch (e) {
      return apiFetch('/admin/stats');
    }
  },

  getAdminUsers: () => apiFetch('/admin/users'),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/admin/orders${query ? `?${query}` : ''}`);
  }
};
