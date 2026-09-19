import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    estimatedTax: 0,
    estimatedShipping: 0,
    grandTotal: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], itemCount: 0, subtotal: 0, estimatedTax: 0, estimatedShipping: 0, grandTotal: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.getCart();
      if (res?.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to add items to your cart.');
    }
    const res = await api.addToCart(productId, quantity);
    if (res?.data) {
      setCart(res.data);
    }
    return res;
  };

  const updateQuantity = async (itemId, quantity) => {
    const res = await api.updateCartItem(itemId, quantity);
    if (res?.data) {
      setCart(res.data);
    }
    return res;
  };

  const removeFromCart = async (itemId) => {
    const res = await api.removeFromCart(itemId);
    if (res?.data) {
      setCart(res.data);
    }
    return res;
  };

  const clearCart = async () => {
    await api.clearCart();
    setCart({ items: [], itemCount: 0, subtotal: 0, estimatedTax: 0, estimatedShipping: 0, grandTotal: 0 });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
