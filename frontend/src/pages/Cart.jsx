import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';
import { api } from '../services/api';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      setValidatingCoupon(true);
      setCouponError('');
      const res = await api.validateCoupon(couponCode.trim(), cart.subtotal);
      if (res?.data?.coupon) {
        setAppliedCoupon({
          code: res.data.coupon.code,
          discountAmount: res.data.discountAmount
        });
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code.');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const discountedSubtotal = Math.max(0, cart.subtotal - discountAmount);
  const taxAmount = Number((discountedSubtotal * 0.18).toFixed(2));
  const shippingAmount = discountedSubtotal > 5000 || discountedSubtotal === 0 ? 0 : 250;
  const finalGrandTotal = Number((discountedSubtotal + taxAmount + shippingAmount).toFixed(2));

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout', {
        state: {
          couponCode: appliedCoupon?.code || null,
          discountAmount
        }
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <div className="p-5 rounded-4 mx-auto" style={{ maxWidth: '520px', background: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
          <i className="bi bi-bag-x fs-1 text-secondary d-block mb-3"></i>
          <h3 className="text-white mb-2">Your Cart is Waiting</h3>
          <p className="text-secondary small mb-4">Please sign in to view your items, saved preferences, and proceed to checkout.</p>
          <Link to="/login?redirect=/cart" className="btn btn-nexora px-4 py-2">Sign In to Continue</Link>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="p-5 rounded-4 mx-auto" style={{ maxWidth: '520px', background: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
          <i className="bi bi-cart3 fs-1 text-secondary d-block mb-3"></i>
          <h3 className="text-white mb-2">Your Shopping Cart is Empty</h3>
          <p className="text-secondary small mb-4">Looks like you haven't added anything to your cart yet. Explore our curated collections to get started!</p>
          <Link to="/products" className="btn btn-nexora px-4 py-2">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3" style={{ borderColor: 'var(--surface-border)' }}>
        <h1 className="fs-2 fw-normal text-dark mb-0" style={{ fontFamily: 'var(--font-editorial)' }}>Shopping Bag ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</h1>
        <button onClick={clearCart} className="btn btn-sm btn-link text-muted hover-dark text-decoration-none p-0">
          Clear Bag
        </button>
      </div>

      <div className="row g-4 g-lg-5">
        {/* Cart Items List */}
        <div className="col-lg-8">
          <div className="p-4 rounded-1 bg-white border" style={{ borderColor: 'var(--surface-border)' }}>
            {cart.items.map((item) => (
              <CartItem
                key={item.item_id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          {/* Coupon Entry */}
          <div className="p-4 rounded-1 bg-white border mt-4" style={{ borderColor: 'var(--surface-border)' }}>
            <h6 className="text-dark fw-semibold mb-2">Promotional Code</h6>
            <p className="text-secondary small mb-3">Complimentary demo codes: <strong className="text-dark">NEXORA10</strong> (10% off) or <strong className="text-dark">WELCOME500</strong> (₹500 off)</p>
            <form onSubmit={handleApplyCoupon} className="d-flex gap-2">
              <input
                type="text"
                placeholder="Enter promo code"
                className="form-control nexora-input text-uppercase"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button type="submit" disabled={validatingCoupon || !couponCode.trim()} className="btn btn-editorial-primary px-4 text-nowrap">
                {validatingCoupon ? 'Verifying...' : 'Apply'}
              </button>
            </form>
            {appliedCoupon && (
              <div className="alert alert-success mt-3 py-2 small d-flex justify-content-between align-items-center mb-0">
                <span><i className="bi bi-check-circle-fill me-2"></i>Coupon <strong>{appliedCoupon.code}</strong> applied (-₹{appliedCoupon.discountAmount})</span>
                <button onClick={() => setAppliedCoupon(null)} className="btn btn-sm btn-link text-success p-0">Remove</button>
              </div>
            )}
            {couponError && (
              <div className="alert alert-danger mt-3 py-2 small mb-0">
                <i className="bi bi-exclamation-circle-fill me-2"></i>{couponError}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Breakdown */}
        <div className="col-lg-4">
          <div className="p-4 rounded-1 bg-white border" style={{ borderColor: 'var(--surface-border)' }}>
            <h5 className="text-dark fw-normal mb-3 pb-2 border-bottom" style={{ fontFamily: 'var(--font-editorial)', borderColor: 'var(--surface-border)' }}>
              Order Summary
            </h5>

            <div className="d-flex justify-content-between text-secondary mb-2 small">
              <span>Subtotal:</span>
              <span className="text-dark fw-medium">₹{Number(cart.subtotal).toLocaleString('en-IN')}</span>
            </div>

            {discountAmount > 0 && (
              <div className="d-flex justify-content-between text-success mb-2 small">
                <span>Discount ({appliedCoupon?.code}):</span>
                <span>-₹{Number(discountAmount).toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="d-flex justify-content-between text-secondary mb-2 small">
              <span>Estimated GST (18%):</span>
              <span className="text-dark fw-medium">₹{Number(taxAmount).toLocaleString('en-IN')}</span>
            </div>

            <div className="d-flex justify-content-between text-secondary mb-3 small">
              <span>Shipping:</span>
              <span className={shippingAmount === 0 ? 'text-success fw-semibold' : 'text-dark'}>
                {shippingAmount === 0 ? 'COMPLIMENTARY' : `₹${shippingAmount}`}
              </span>
            </div>

            <div className="d-flex justify-content-between text-dark fw-bold fs-5 pt-3 border-top mb-4" style={{ borderColor: 'var(--surface-border)' }}>
              <span>Total:</span>
              <span className="text-dark">₹{Number(finalGrandTotal).toLocaleString('en-IN')}</span>
            </div>

            <button onClick={handleProceedToCheckout} className="btn btn-editorial-primary w-100 py-3">
              Proceed to Checkout &rarr;
            </button>

            <div className="text-center mt-3">
              <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-shield-lock me-1"></i> 256-bit encrypted checkout
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
