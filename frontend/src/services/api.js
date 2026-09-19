const API_BASE = '/api';

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

export const api = {
  // Auth
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  getMe: () => apiFetch('/auth/me'),
  updateProfile: (body) => apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Products & Categories
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/products${query ? `?${query}` : ''}`);
  },
  getProduct: (idOrSlug) => apiFetch(`/products/${idOrSlug}`),
  getCategories: () => apiFetch('/categories'),
  createProduct: (body) => apiFetch('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) => apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: () => apiFetch('/cart'),
  addToCart: (productId, quantity = 1) => apiFetch('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (itemId, quantity) => apiFetch(`/cart/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeFromCart: (itemId) => apiFetch(`/cart/${itemId}`, { method: 'DELETE' }),
  clearCart: () => apiFetch('/cart', { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => apiFetch('/wishlist'),
  addToWishlist: (productId) => apiFetch('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeFromWishlist: (productId) => apiFetch(`/wishlist/${productId}`, { method: 'DELETE' }),

  // Orders & Checkout
  createOrder: (body) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getUserOrders: () => apiFetch('/orders'),
  getOrder: (id) => apiFetch(`/orders/${id}`),
  validateCoupon: (code, subtotal) => apiFetch('/orders/validate-coupon', { method: 'POST', body: JSON.stringify({ code, subtotal }) }),
  updateOrderStatus: (id, body) => apiFetch(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),

  // Reviews
  getReviews: (productId) => apiFetch(`/products/${productId}/reviews`),
  addReview: (productId, body) => apiFetch(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(body) }),

  // Blockchain Web3
  getCryptoQuote: (fiatAmount) => apiFetch(`/blockchain/quote?fiatAmount=${fiatAmount}`),
  verifyBlockchainPayment: (body) => apiFetch('/blockchain/verify', { method: 'POST', body: JSON.stringify(body) }),
  getBlockchainTransaction: (hash) => apiFetch(`/blockchain/tx/${hash}`),

  // Admin Dashboard
  getAdminStats: () => apiFetch('/admin/stats'),
  getAdminUsers: () => apiFetch('/admin/users'),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/admin/orders${query ? `?${query}` : ''}`);
  }
};
