import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="editorial-footer">
      <div className="container">
        <div className="row g-4 g-lg-5">
          {/* Brand & Editorial Mission */}
          <div className="col-12 col-lg-4">
            <Link to="/" className="text-decoration-none">
              <span className="brand-title d-block mb-3" style={{ fontSize: '1.75rem' }}>NEXORA</span>
            </Link>
            <p className="text-secondary small mb-4" style={{ maxWidth: '320px', lineHeight: 1.7 }}>
              Redefining everyday luxury with minimalist silhouettes, sustainable textiles, and dual settlement in Indian Rupee and on-chain Ethereum.
            </p>
            <div className="d-flex gap-3 text-dark">
              <a href="#" className="text-dark hover-secondary" aria-label="Instagram"><i className="bi bi-instagram fs-5"></i></a>
              <a href="#" className="text-dark hover-secondary" aria-label="Pinterest"><i className="bi bi-pinterest fs-5"></i></a>
              <a href="#" className="text-dark hover-secondary" aria-label="Twitter"><i className="bi bi-twitter-x fs-5"></i></a>
              <a href="#" className="text-dark hover-secondary" aria-label="Facebook"><i className="bi bi-facebook fs-5"></i></a>
            </div>
          </div>

          {/* Column 1: SHOP */}
          <div className="col-6 col-md-3 col-lg-2">
            <h5 className="footer-col-title">Shop</h5>
            <ul className="footer-link-list">
              <li><Link to="/products?category=fashion">Women</Link></li>
              <li><Link to="/products?category=apparel-accessories">Men</Link></li>
              <li><Link to="/products?sort=newest">New Arrivals</Link></li>
              <li><Link to="/products?sort=popular">Best Sellers</Link></li>
              <li><Link to="/products?category=accessories">Accessories</Link></li>
              <li><Link to="/products?sale=true" className="text-danger fw-semibold">The Archive (Sale)</Link></li>
            </ul>
          </div>

          {/* Column 2: CLIENT CARE / HELP */}
          <div className="col-6 col-md-3 col-lg-2">
            <h5 className="footer-col-title">Client Care</h5>
            <ul className="footer-link-list">
              <li><a href="#contact">Client Concierge</a></li>
              <li><a href="#shipping">Complimentary Shipping</a></li>
              <li><a href="#returns">30-Day Returns</a></li>
              <li><a href="#size-guide">Tailoring & Sizing Guide</a></li>
              <li><a href="#faq">Frequently Asked Questions</a></li>
              <li><Link to="/profile?tab=orders">Track Orders</Link></li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div className="col-6 col-md-3 col-lg-2">
            <h5 className="footer-col-title">Company</h5>
            <ul className="footer-link-list">
              <li><a href="#about">About NEXORA</a></li>
              <li><a href="#story">Atelier & Craftsmanship</a></li>
              <li><a href="#sustainability">Sustainable Wool & Cotton</a></li>
              <li><a href="#journal">Editorial Journal</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><Link to="/admin" className="text-dark fw-medium">Staff Portal</Link></li>
            </ul>
          </div>

          {/* Column 4: PAYMENTS & SETTLEMENT */}
          <div className="col-6 col-md-3 col-lg-2">
            <h5 className="footer-col-title">Payment Methods</h5>
            <p className="text-secondary small mb-3" style={{ lineHeight: 1.6 }}>
              Instant settlement supported via Visa, MasterCard, RuPay, UPI, and verified Ethereum Web3 wallet signatures.
            </p>
            <div className="d-flex gap-2 flex-wrap text-secondary fs-4">
              <i className="bi bi-credit-card-2-front" title="Card Settlement"></i>
              <i className="bi bi-wallet2" title="Web3 Crypto"></i>
              <i className="bi bi-shield-check" title="Encrypted 256-bit"></i>
              <i className="bi bi-currency-rupee" title="INR Supported"></i>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>© {new Date().getFullYear()} NEXORA Atelier Ltd. All rights reserved.</div>
          <div className="d-flex gap-4 flex-wrap">
            <a href="#privacy" className="text-muted hover-dark">Privacy Policy</a>
            <a href="#terms" className="text-muted hover-dark">Terms of Service</a>
            <a href="#cookies" className="text-muted hover-dark">Cookie Preferences</a>
            <a href="#accessibility" className="text-muted hover-dark">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
