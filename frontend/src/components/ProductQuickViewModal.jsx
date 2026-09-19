import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductQuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const isOutOfStock = Number(product.stock) <= 0;
  const isLowStock = Number(product.stock) > 0 && Number(product.stock) <= 5;
  const wishlisted = isInWishlist(product.id);

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

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="quick-view-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="quick-view-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <i className="bi bi-x-lg"></i>
        </button>

        <div className="quick-view-content">
          {/* Left Column: Image with Badges & Overlays */}
          <div className="quick-view-image-pane">
            <div className="quick-view-image-container">
              {/* Badges */}
              <div className="quick-view-badges">
                {discountPercent > 0 && (
                  <span className="quick-view-badge sale">
                    -{discountPercent}% OFF
                  </span>
                )}
                {product.is_trending && (
                  <span className="quick-view-badge">
                    TRENDING
                  </span>
                )}
                {isLowStock && (
                  <span className="quick-view-badge warning">
                    ONLY {product.stock} LEFT
                  </span>
                )}
              </div>

              <img
                src={
                  product.primary_image_url ||
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
                }
                alt={product.name}
                className="quick-view-img"
              />

              {/* Sold-out Overlay */}
              {isOutOfStock && (
                <div className="quick-view-sold-out-overlay">
                  <div className="quick-view-sold-out-badge">
                    <i className="bi bi-slash-circle me-1"></i>
                    SOLD OUT
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Product Details & Actions */}
          <div className="quick-view-details-pane">
            <div className="quick-view-body">
              <div className="quick-view-header-meta">
                <span className="quick-view-brand">{product.brand || product.category_name}</span>
                <span className="quick-view-cat-pill">
                  {product.category_name}
                </span>
              </div>

              <h2 className="quick-view-title">{product.name}</h2>

              {/* Rating & Reviews */}
              <div className="quick-view-rating">
                <i className="bi bi-star-fill text-warning"></i>
                <span className="rating-score">
                  {Number(product.rating || 5.0).toFixed(1)}
                </span>
                <span className="rating-count">
                  ({product.review_count || 48} verified reviews)
                </span>
                <span className="rating-auth">
                  <i className="bi bi-shield-check me-1"></i>Authentic
                </span>
              </div>

              {/* Pricing & ETH Equivalent */}
              <div className="quick-view-price-box">
                <div className="quick-view-prices">
                  <span className="quick-view-current-price">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </span>
                  {product.compare_at_price && (
                    <span className="quick-view-old-price">
                      ₹{Number(product.compare_at_price).toLocaleString('en-IN')}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="quick-view-save-pill">
                      Save ₹
                      {(
                        Number(product.compare_at_price) - Number(product.price)
                      ).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Web3 Dual Currency Pill */}
                <div className="quick-view-eth-pill">
                  <span className="eth-icon">Ξ</span>
                  <span>~{ethPrice} ETH</span>
                  <span className="eth-tag">Sepolia</span>
                </div>
              </div>

              {/* Description Preview */}
              <p className="quick-view-desc">
                {product.short_description ||
                  product.description ||
                  'Precision-engineered craftsmanship featuring luxurious materials, tailored silhouette, and signature minimal detailing.'}
              </p>

              {/* Stock Status Indicator */}
              <div className="quick-view-stock">
                {isOutOfStock ? (
                  <span className="text-danger fw-semibold">
                    <i className="bi bi-x-circle me-1"></i>Currently Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="text-warning fw-semibold">
                    <i className="bi bi-lightning-charge-fill me-1"></i>Hurry, only {product.stock}{' '}
                    items left in stock!
                  </span>
                ) : (
                  <span className="text-success fw-semibold">
                    <i className="bi bi-check-circle-fill me-1"></i>In Stock & Ready to Ship
                  </span>
                )}
              </div>

              {/* Quantity Selector & Add to Cart */}
              <div className="quick-view-actions">
                {!isOutOfStock && (
                  <div className="quick-view-qty">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || adding}
                      className="quick-view-qty-btn"
                      aria-label="Decrease quantity"
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <span className="quick-view-qty-val">{quantity}</span>
                    <button
                      onClick={() =>
                        setQuantity((q) =>
                          product.stock ? Math.min(Number(product.stock), q + 1) : q + 1
                        )
                      }
                      disabled={adding || (product.stock && quantity >= Number(product.stock))}
                      className="quick-view-qty-btn"
                      aria-label="Increase quantity"
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                  className={`quick-view-add-btn ${added ? 'added' : ''} ${
                    isOutOfStock ? 'disabled opacity-50' : ''
                  }`}
                >
                  {adding ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Adding...
                    </>
                  ) : added ? (
                    <>
                      <i className="bi bi-check2-circle me-2"></i>Added to Bag!
                    </>
                  ) : isOutOfStock ? (
                    <>
                      <i className="bi bi-bell me-2"></i>Notify When Available
                    </>
                  ) : (
                    <>
                      <i className="bi bi-bag-plus me-2"></i>Add to Bag (₹
                      {(Number(product.price) * quantity).toLocaleString('en-IN')})
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`quick-view-wishlist-btn ${wishlisted ? 'active' : ''}`}
                  title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <i className={`bi ${wishlisted ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
                </button>
              </div>

              {/* Navigation to Full Product Page */}
              <div className="quick-view-footer">
                <Link
                  to={`/products/${product.slug || product.id}`}
                  onClick={onClose}
                  className="quick-view-more-link"
                >
                  View Full Specifications & Reviews
                  <i className="bi bi-arrow-right"></i>
                </Link>

                <span className="quick-view-shipping-badge">
                  <i className="bi bi-truck me-1"></i>Free Express Shipping
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
