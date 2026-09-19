import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAdding(true);
      await addToCart(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist(product.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  const wishlisted = isInWishlist(product.id);
  const isOutOfStock = Number(product.stock) <= 0;
  const discountPercent =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
      ? Math.round(
          ((Number(product.compare_at_price) - Number(product.price)) /
            Number(product.compare_at_price)) *
            100
        )
      : 0;

  // Approximate ETH conversion (1 ETH ~ 2,50,000 INR)
  const ethPrice = (Number(product.price) / 250000).toFixed(4);

  return (
    <article className="product-card" aria-label={product.name}>
      {/* Product Image Wrap */}
      <div className="product-image-wrap">
        <Link to={`/products/${product.slug || product.id}`}>
          <img
            src={
              product.primary_image_url ||
              'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'
            }
            alt={product.name}
            loading="lazy"
          />
        </Link>

        {/* Minimalist Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`card-wishlist-btn ${wishlisted ? 'active' : ''}`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
        </button>

        {/* Minimal Badges */}
        {discountPercent > 0 ? (
          <span className="minimal-badge">SALE</span>
        ) : product.is_trending ? (
          <span className="minimal-badge">TRENDING</span>
        ) : isOutOfStock ? (
          <span className="minimal-badge bg-secondary">SOLD OUT</span>
        ) : null}

        {/* Hover Quick Actions */}
        <div className="card-quick-actions">
          {onQuickView && (
            <button
              onClick={handleQuickViewClick}
              className="quick-add-btn"
              title="Quick View"
            >
              Quick View
            </button>
          )}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className="quick-add-btn"
            title="Add to Bag"
          >
            {adding ? 'Adding...' : added ? 'Added' : isOutOfStock ? 'Sold Out' : 'Add to Bag'}
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="product-meta">
        <div className="d-flex justify-content-between align-items-center">
          <span className="product-brand">{product.brand || product.category_name || 'COLLECTION'}</span>
          <span className="product-eth-price">Ξ {ethPrice}</span>
        </div>

        <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none">
          <h3 className="product-title">{product.name}</h3>
        </Link>

        <div className="product-price-row">
          <span className="product-current-price">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </span>
          {product.compare_at_price && (
            <span className="product-compare-price">
              ₹{Number(product.compare_at_price).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
