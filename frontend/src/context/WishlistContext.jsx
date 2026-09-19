import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ items: [], totalItems: 0 });
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist({ items: [], totalItems: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.getWishlist();
      if (res?.data) {
        setWishlist(res.data);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to save items to your wishlist.');
    }
    const isWishlisted = wishlist.items.some(i => i.product_id === productId);
    if (isWishlisted) {
      const res = await api.removeFromWishlist(productId);
      if (res?.data) setWishlist(res.data);
    } else {
      const res = await api.addToWishlist(productId);
      if (res?.data) setWishlist(res.data);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.items.some(i => i.product_id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        toggleWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
