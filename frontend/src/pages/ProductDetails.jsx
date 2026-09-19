import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.getProduct(id);
      if (res?.data?.product) {
        const p = res.data.product;
        setProduct(p);
        setSelectedImage(p.primary_image_url || p.images?.[0]?.image_url);
      }
    } catch (err) {
      setError(err.message || 'Product not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await addToCart(product.id, quantity);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to write a review.');
      return;
    }
    try {
      setSubmittingReview(true);
      await api.addReview(product.id, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });
      setReviewTitle('');
      setReviewComment('');
      await fetchProduct();
      alert('Review posted successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-secondary small mt-2">Loading product specifications...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-danger mb-3">Product Not Found</h4>
        <p className="text-secondary">{error || 'The requested product could not be located.'}</p>
        <Link to="/products" className="btn btn-nexora mt-2">Return to Catalog</Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const isOutOfStock = Number(product.stock) <= 0;
  const isLowStock = Number(product.stock) <= Number(product.low_stock_threshold || 5);

  return (
    <div className="container py-5">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-secondary">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/products" className="text-secondary">Products</Link></li>
          <li className="breadcrumb-item"><Link to={`/products?category=${product.category_slug}`} className="text-secondary">{product.category_name}</Link></li>
          <li className="breadcrumb-item active text-light" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="row g-5">
        {/* Left Column: Gallery */}
        <div className="col-lg-6">
          <div className="rounded-1 overflow-hidden position-relative mb-3" style={{ background: '#F5F5F3', border: '1px solid var(--surface-border)', aspectRatio: '3/4' }}>
            <img
              src={selectedImage}
              alt={product.name}
              className="w-100 h-100 object-fit-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="d-flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`rounded-1 overflow-hidden border p-0 flex-shrink-0 ${selectedImage === img.image_url ? 'border-dark' : 'border-secondary'}`}
                  style={{ width: '70px', height: '70px', background: '#F5F5F3' }}
                >
                  <img src={img.image_url} alt={img.alt_text} className="w-100 h-100 object-fit-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specs & Actions */}
        <div className="col-lg-6">
          <div className="product-brand mb-2">{product.brand || product.category_name}</div>
          <h1 className="fs-1 fw-normal text-dark mb-2" style={{ fontFamily: 'var(--font-editorial)' }}>{product.name}</h1>
          <div className="text-muted small mb-3">Ref: {product.sku}</div>

          {/* Rating */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="rating-stars text-warning">
              <i className="bi bi-star-fill"></i>
              <span className="fw-bold text-dark ms-1">{Number(product.rating || 0).toFixed(1)}</span>
            </div>
            <span className="text-secondary small">({product.review_count || 0} reviews)</span>
          </div>

          {/* Price */}
          <div className="d-flex align-items-baseline gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--surface-border)' }}>
            <span className="display-6 fw-bold text-dark">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {product.compare_at_price && (
              <span className="fs-5 text-muted text-decoration-line-through">
                ₹{Number(product.compare_at_price).toLocaleString('en-IN')}
              </span>
            )}
            <span className="badge bg-light text-dark border px-2 py-1 small">
              Inclusive of GST
            </span>
          </div>

          {/* Short description */}
          <p className="text-secondary mb-4 fs-6" style={{ lineHeight: 1.7 }}>{product.short_description || product.description}</p>

          {/* Stock Alert */}
          <div className="mb-4">
            {isOutOfStock ? (
              <span className="badge bg-secondary px-3 py-2"><i className="bi bi-slash-circle me-1"></i> Out of Stock</span>
            ) : isLowStock ? (
              <span className="badge bg-warning text-dark px-3 py-2"><i className="bi bi-exclamation-circle me-1"></i> Only {product.stock} pieces remaining</span>
            ) : (
              <span className="badge bg-light text-dark border px-3 py-2"><i className="bi bi-check2 me-1"></i> In Stock & Ready to Ship</span>
            )}
          </div>

          {/* Quantity and Controls */}
          <div className="product-controls-flex mb-4">
            {/* Quantity Stepper */}
            <div className="d-flex align-items-center border rounded-1 px-3 py-2 bg-white" style={{ borderColor: 'var(--surface-border)' }}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                className="btn btn-sm btn-link text-dark p-0 text-decoration-none"
              >
                <i className="bi bi-dash fs-5"></i>
              </button>
              <span className="text-dark fw-bold px-4">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock || isOutOfStock}
                className="btn btn-sm btn-link text-dark p-0 text-decoration-none"
              >
                <i className="bi bi-plus fs-5"></i>
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className={`btn btn-lg ${addedNotice ? 'btn-success' : 'btn-editorial-primary'} flex-grow-1 py-3`}
            >
              {addingToCart ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : addedNotice ? (
                <><i className="bi bi-check2"></i> Added to Bag</>
              ) : (
                <><i className="bi bi-bag"></i> Add to Bag</>
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`btn btn-lg border ${wishlisted ? 'text-danger border-danger' : 'text-dark border'}`}
              style={{ backgroundColor: '#FFFFFF', borderColor: 'var(--surface-border)' }}
              aria-label="Toggle Wishlist"
            >
              <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Description Deep Dive */}
      <section className="mt-5 pt-4 border-top" style={{ borderColor: 'var(--surface-border)' }}>
        <h3 className="fs-3 fw-normal text-dark mb-3" style={{ fontFamily: 'var(--font-editorial)' }}>Details & Craftsmanship</h3>
        <div className="p-4 rounded-1 bg-white border" style={{ borderColor: 'var(--surface-border)' }}>
          <p className="text-secondary leading-relaxed mb-0" style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="mt-5 pt-4 border-top" style={{ borderColor: 'var(--surface-border)' }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h3 className="fs-3 fw-normal text-dark mb-1" style={{ fontFamily: 'var(--font-editorial)' }}>Client Reviews & Feedback</h3>
            <p className="text-secondary small mb-0">Verified client impressions and ratings</p>
          </div>
        </div>

        <div className="row g-4">
          {/* Write a Review Form */}
          <div className="col-lg-5">
            <div className="p-4 rounded-1 bg-white border" style={{ borderColor: 'var(--surface-border)' }}>
              <h5 className="text-dark mb-3">Share Your Review</h5>
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">Rating</label>
                    <select
                      className="form-select form-select-sm nexora-input"
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                      <option value="4">⭐⭐⭐⭐ (4 - Great)</option>
                      <option value="3">⭐⭐⭐ (3 - Average)</option>
                      <option value="2">⭐⭐ (2 - Poor)</option>
                      <option value="1">⭐ (1 - Terrible)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">Headline</label>
                    <input
                      type="text"
                      className="form-control form-control-sm nexora-input"
                      placeholder="e.g. Exceptional tailoring and fabric"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">Detailed Review</label>
                    <textarea
                      rows="3"
                      required
                      className="form-control form-control-sm nexora-input"
                      placeholder="Describe material feel, fit, silhouette, daily wear..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    ></textarea>
                  </div>
                  <button type="submit" disabled={submittingReview} className="btn btn-sm btn-editorial-primary w-100">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-secondary small mb-3">Sign in to share your impressions of this piece.</p>
                  <Link to="/login" className="btn btn-sm btn-editorial-outline px-4">Sign In</Link>
                </div>
              )}
            </div>
          </div>

          {/* Review List */}
          <div className="col-lg-7">
            {product.reviews && product.reviews.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {product.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-1 bg-white border" style={{ borderColor: 'var(--surface-border)' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={rev.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
                          alt={rev.user_name}
                          className="rounded-circle border"
                          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="text-dark fw-bold small">{rev.user_name}</div>
                          {rev.is_verified_purchase && (
                            <span className="badge bg-light text-dark border small" style={{ fontSize: '0.65rem' }}>
                              <i className="bi bi-patch-check-fill me-1"></i> Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="rating-stars text-warning">
                        {[...Array(rev.rating)].map((_, i) => (
                          <i key={i} className="bi bi-star-fill" style={{ fontSize: '0.75rem' }}></i>
                        ))}
                      </div>
                    </div>
                    {rev.title && <h6 className="text-dark fw-semibold small mb-1">{rev.title}</h6>}
                    <p className="text-secondary small mb-0">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 p-4 rounded-1 bg-white border" style={{ borderColor: 'var(--surface-border)' }}>
                <p className="text-secondary small mb-0">No client reviews yet for this piece. Be the first to review.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
