import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useWeb3 } from '../context/Web3Context';

export default function Navbar() {
  const { user, isAuthenticated, logout, isAdmin, isManager } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { account, isConnected, connectWallet, formatAddress } = useWeb3();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="announcement-bar d-flex align-items-center justify-content-center">
        <span>COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER ₹999</span>
        <Link to="/products" className="announcement-link d-none d-sm-inline">
          DISCOVER THE EDIT &rarr;
        </Link>
      </div>

      {/* 2. MAIN EDITORIAL HEADER */}
      <header className="editorial-header">
        <nav className="nav-container" aria-label="Main Navigation">
          {/* Mobile Menu Hamburger */}
          <button
            className="d-lg-none nav-icon-btn me-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-4`}></i>
          </button>

          {/* Left Navigation Links (Desktop) */}
          <div className="d-none d-lg-flex align-items-center gap-4">
            <Link
              to="/products"
              className={`nav-link-item ${isActive('/products') ? 'active' : ''}`}
            >
              Shop All
            </Link>
            <Link
              to="/products?category=fashion"
              className="nav-link-item"
            >
              Women
            </Link>
            <Link
              to="/products?category=apparel-accessories"
              className="nav-link-item"
            >
              Men
            </Link>
            <Link
              to="/products?sort=newest"
              className="nav-link-item"
            >
              New Arrivals
            </Link>
            <Link
              to="/products?sale=true"
              className="nav-link-item text-danger fw-semibold"
            >
              Sale
            </Link>
          </div>

          {/* Center Brand Logo */}
          <div className="text-center">
            <Link to="/" className="text-decoration-none">
              <span className="brand-title">NEXORA</span>
            </Link>
          </div>

          {/* Right Action Suite */}
          <div className="d-flex align-items-center gap-2 gap-sm-3">
            {/* Inline Search Bar (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="d-none d-xl-flex editorial-search-wrap">
              <i className="bi bi-search editorial-search-icon"></i>
              <input
                type="text"
                className="editorial-search-input"
                placeholder="Search collection, jackets, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search collection"
              />
            </form>

            {/* Mobile / Tablet Search Icon Trigger */}
            <button
              className="nav-icon-btn d-xl-none"
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Toggle search"
            >
              <i className="bi bi-search"></i>
            </button>

            {/* Admin / Manager Dashboard link */}
            {isManager && (
              <Link
                to="/admin"
                className="btn btn-sm btn-outline-dark px-2.5 py-1 small d-none d-md-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
              >
                <i className="bi bi-speedometer2"></i> Dashboard
              </Link>
            )}

            {/* Web3 Wallet Connect */}
            <button
              onClick={connectWallet}
              className={`btn-web3 ${isConnected ? 'bg-dark text-white' : ''}`}
              title={isConnected ? `Connected: ${account}` : 'Connect Web3 Wallet'}
              aria-label="Web3 Wallet"
            >
              <i className="bi bi-wallet2"></i>
              <span className="d-none d-sm-inline">
                {isConnected ? formatAddress(account) : 'Web3'}
              </span>
            </button>

            {/* Wishlist Link */}
            <Link
              to="/profile?tab=wishlist"
              className="nav-icon-btn"
              aria-label="Wishlist"
              title="Saved Items"
            >
              <i className="bi bi-heart"></i>
              {wishlist.totalItems > 0 && (
                <span className="nav-badge-count">{wishlist.totalItems}</span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="nav-icon-btn"
              aria-label="Shopping Bag"
              title="Shopping Bag"
            >
              <i className="bi bi-bag"></i>
              {cart.itemCount > 0 && (
                <span className="nav-badge-count">{cart.itemCount}</span>
              )}
            </Link>

            {/* Account / User Menu */}
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="nav-icon-btn dropdown-toggle border-0 p-0"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  aria-label="User menu"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
                    alt={user.name}
                    className="rounded-circle border"
                    style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                  />
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border mt-2 py-2" style={{ minWidth: '180px' }}>
                  <li className="px-3 py-1 text-muted small border-bottom mb-1">
                    Signed in as <strong className="text-dark d-block text-truncate">{user.name}</strong>
                  </li>
                  <li><Link className="dropdown-item py-1.5 small" to="/profile"><i className="bi bi-person me-2"></i> Account Profile</Link></li>
                  <li><Link className="dropdown-item py-1.5 small" to="/profile?tab=orders"><i className="bi bi-box-seam me-2"></i> Orders & Receipts</Link></li>
                  {isAdmin && (
                    <li><Link className="dropdown-item py-1.5 small text-primary" to="/admin"><i className="bi bi-shield-lock me-2"></i> Administration</Link></li>
                  )}
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button className="dropdown-item py-1.5 small text-danger" onClick={logout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-sm btn-editorial-outline py-1 px-3"
                style={{ fontSize: '0.75rem' }}
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>

        {/* Collapsible Mobile/Tablet Search Drawer */}
        {showSearch && (
          <div className="d-xl-none p-3 border-top bg-white animate__animated animate__fadeIn">
            <form onSubmit={handleSearchSubmit} className="editorial-search-wrap mx-auto">
              <i className="bi bi-search editorial-search-icon"></i>
              <input
                type="text"
                className="editorial-search-input"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="d-lg-none border-top bg-white p-4 animate__animated animate__fadeIn">
            <div className="d-flex flex-column gap-3">
              <Link
                to="/products"
                className="text-dark fw-semibold text-uppercase small text-decoration-none"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop All
              </Link>
              <Link
                to="/products?category=fashion"
                className="text-dark fw-semibold text-uppercase small text-decoration-none"
                onClick={() => setMobileMenuOpen(false)}
              >
                Women's Collection
              </Link>
              <Link
                to="/products?category=apparel-accessories"
                className="text-dark fw-semibold text-uppercase small text-decoration-none"
                onClick={() => setMobileMenuOpen(false)}
              >
                Men's Collection
              </Link>
              <Link
                to="/products?sort=newest"
                className="text-dark fw-semibold text-uppercase small text-decoration-none"
                onClick={() => setMobileMenuOpen(false)}
              >
                New Arrivals
              </Link>
              <Link
                to="/products?sale=true"
                className="text-danger fw-semibold text-uppercase small text-decoration-none"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sale & Archive
              </Link>
              <hr className="my-2" />
              <Link
                to="/profile?tab=wishlist"
                className="text-secondary small text-decoration-none"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wishlist ({wishlist.totalItems})
              </Link>
              <Link
                to="/cart"
                className="text-secondary small text-decoration-none"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bag ({cart.itemCount})
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
