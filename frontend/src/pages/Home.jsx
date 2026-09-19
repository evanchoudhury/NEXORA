import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ProductGrid from '../components/ProductGrid';

const EDITORIAL_CATEGORIES = [
  {
    name: 'Outerwear',
    slug: 'fashion',
    count: '12',
    image: 'https://images.unsplash.com/photo-1544022613-e87ce7526edb?w=300&q=80'
  },
  {
    name: 'Dresses',
    slug: 'apparel-accessories',
    count: '16',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&q=80'
  },
  {
    name: 'Shirts & Polos',
    slug: 'apparel-accessories',
    count: '24',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&q=80'
  },
  {
    name: 'Footwear',
    slug: 'sports-fitness',
    count: '08',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&q=80'
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    count: '19',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80'
  },
  {
    name: 'Tailoring',
    slug: 'fashion',
    count: '11',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80'
  },
  {
    name: 'Knitwear',
    slug: 'apparel-accessories',
    count: '14',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&q=80'
  },
  {
    name: 'Living & Scents',
    slug: 'home-living',
    count: '07',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&q=80'
  }
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('new');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catRes, trendRes, featRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ trending: true, limit: 8 }),
          api.getProducts({ featured: true, limit: 8 })
        ]);

        if (catRes?.data?.categories) setCategories(catRes.data.categories);
        if (trendRes?.data?.products) setTrendingProducts(trendRes.data.products);
        if (featRes?.data?.products) setFeaturedProducts(featRes.data.products);
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <main>
      {/* =================================================================
          1. EDITORIAL HERO SECTION (Lyre & Unicoz Style)
          ================================================================= */}
      <section className="position-relative overflow-hidden" style={{ backgroundColor: '#F9F9F7' }}>
        <div className="container py-4 py-lg-5">
          <div className="row align-items-center g-4 g-lg-5">
            {/* Left Editorial Copy */}
            <div className="col-lg-6 order-2 order-lg-1 py-3 py-lg-5">
              <div className="d-inline-block text-uppercase fw-semibold mb-3 tracking-wider text-secondary" style={{ fontSize: '0.78rem', letterSpacing: '0.18em' }}>
                AUTUMN / WINTER 2026
              </div>

              <h1 className="display-3 fw-normal mb-3" style={{ fontFamily: 'var(--font-editorial)', lineHeight: 1.05 }}>
                Modern Essentials <br />
                <span className="fst-italic" style={{ color: '#262626' }}>For Everyday Style</span>
              </h1>

              <p className="text-secondary mb-4 fs-6" style={{ maxWidth: '480px', lineHeight: 1.7 }}>
                Discover our latest collection of refined everyday pieces, crafted from organic wool, supima cotton, and structured tailoring for effortless silhouettes.
              </p>

              <div className="d-flex align-items-center gap-3 flex-wrap">
                <Link to="/products?category=apparel-accessories" className="btn btn-editorial-primary px-4 py-3">
                  SHOP MEN
                </Link>
                <Link to="/products?category=fashion" className="btn btn-editorial-outline px-4 py-3">
                  SHOP WOMEN
                </Link>
              </div>

              {/* Minimal Trust Indicator */}
              <div className="d-flex align-items-center gap-4 mt-5 pt-3 border-top" style={{ borderColor: 'var(--surface-border)' }}>
                <div className="d-flex align-items-center gap-2 text-secondary small">
                  <i className="bi bi-shield-check text-dark"></i>
                  <span>Authentic Certified</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-secondary small">
                  <i className="bi bi-truck text-dark"></i>
                  <span>Free Global Shipping ₹999+</span>
                </div>
              </div>
            </div>

            {/* Right Editorial Imagery */}
            <div className="col-lg-6 order-1 order-lg-2">
              <div className="position-relative rounded-2 overflow-hidden shadow-sm" style={{ aspectRatio: '4 / 4.8', maxHeight: '680px' }}>
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=85"
                  alt="NEXORA Autumn Winter 2026 Editorial"
                  className="w-100 h-100 object-fit-cover"
                  style={{ objectPosition: 'center 20%' }}
                />
                <div className="position-absolute bottom-0 start-0 m-4 p-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-1 shadow-sm d-none d-sm-block" style={{ maxWidth: '240px' }}>
                  <div className="small fw-semibold text-uppercase tracking-wider text-muted" style={{ fontSize: '0.68rem' }}>LOOK 04</div>
                  <div className="fw-medium text-dark small">Double-Breasted Cashmere Trench</div>
                  <div className="text-secondary small mt-1">₹34,999</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          2. CIRCULAR CATEGORY NAVIGATION (Unicoz Reference Style)
          ================================================================= */}
      <section className="container py-5">
        <div className="text-center mb-4">
          <span className="text-uppercase text-muted fw-semibold small tracking-wider" style={{ letterSpacing: '0.14em', fontSize: '0.72rem' }}>
            CURATED DEPARTMENTS
          </span>
          <h2 className="fs-3 fw-normal mt-1" style={{ fontFamily: 'var(--font-editorial)' }}>
            Explore By Category
          </h2>
        </div>

        <div className="circular-categories-row">
          {EDITORIAL_CATEGORIES.map((cat, idx) => (
            <Link key={idx} to={`/products?category=${cat.slug}`} className="circular-cat-item">
              <div className="circular-cat-thumb-wrap">
                <img src={cat.image} alt={cat.name} loading="lazy" />
                <span className="circular-cat-count-badge">{cat.count}</span>
              </div>
              <span className="circular-cat-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* =================================================================
          3. FEATURED PRODUCTS / NEW ARRIVALS (Lemaire & Nanushka Style)
          ================================================================= */}
      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
          <div>
            <span className="text-uppercase text-muted fw-semibold small tracking-wider" style={{ letterSpacing: '0.14em', fontSize: '0.72rem' }}>
              THE COLLECTION
            </span>
            <h2 className="fs-2 fw-normal mb-0" style={{ fontFamily: 'var(--font-editorial)' }}>
              New Arrivals
            </h2>
          </div>

          {/* Section Tabs */}
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => setActiveTab('new')}
              className={`btn btn-sm px-0 border-0 ${activeTab === 'new' ? 'fw-bold text-dark border-bottom border-dark pb-1' : 'text-secondary'}`}
              style={{ fontSize: '0.82rem', letterSpacing: '0.06em', borderRadius: 0 }}
            >
              LATEST DROPS
            </button>
            <span className="text-muted">/</span>
            <button
              onClick={() => setActiveTab('trending')}
              className={`btn btn-sm px-0 border-0 ${activeTab === 'trending' ? 'fw-bold text-dark border-bottom border-dark pb-1' : 'text-secondary'}`}
              style={{ fontSize: '0.82rem', letterSpacing: '0.06em', borderRadius: 0 }}
            >
              TRENDING
            </button>
            <span className="text-muted">/</span>
            <Link
              to="/products"
              className="text-secondary small text-decoration-none hover-dark d-none d-sm-inline"
              style={{ fontSize: '0.82rem', letterSpacing: '0.06em' }}
            >
              VIEW ALL &rarr;
            </Link>
          </div>
        </div>

        {/* 4-Column Clean Grid */}
        <ProductGrid
          products={activeTab === 'new' ? featuredProducts : trendingProducts}
          loading={loading}
        />
      </section>

      {/* =================================================================
          4. FULL-WIDTH EDITORIAL PROMOTIONAL BANNER (Reference 2 & 3)
          ================================================================= */}
      <section className="container my-5">
        <div
          className="editorial-full-banner"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.7) 45%, rgba(255, 255, 255, 0.1) 100%), url('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=85')`,
            backgroundPosition: 'center 30%'
          }}
        >
          <div className="editorial-banner-content">
            <span className="text-uppercase text-secondary fw-semibold small tracking-wider mb-2 d-block" style={{ letterSpacing: '0.15em', fontSize: '0.75rem' }}>
              AUTUMN EDITORIAL
            </span>
            <h2 className="display-4 fw-normal mb-3" style={{ fontFamily: 'var(--font-editorial)' }}>
              The Winter Edit
            </h2>
            <p className="text-secondary mb-4" style={{ lineHeight: 1.7 }}>
              Layer up with refined essentials. Structured outerwear tailored for transitional temperatures with water-resistant textiles and buttery merino linings.
            </p>
            <Link to="/products" className="btn btn-editorial-primary px-4 py-3">
              EXPLORE COLLECTION &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================================
          5. TWO-COLUMN SPLIT PROMOTIONAL SECTION (Requirement 11)
          ================================================================= */}
      <section className="container py-4">
        <div className="two-col-promo-grid">
          {/* Card 1 */}
          <Link
            to="/products?category=apparel-accessories"
            className="promo-col-card"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=900&q=80')` }}
          >
            <div className="promo-col-inner">
              <span className="text-uppercase small tracking-wider opacity-75 mb-1 d-block" style={{ fontSize: '0.72rem', letterSpacing: '0.15em' }}>
                DAILY UNIFORM
              </span>
              <h3 className="fs-3 fw-normal mb-2" style={{ fontFamily: 'var(--font-editorial)' }}>
                Everyday Essentials
              </h3>
              <span className="text-white text-decoration-underline small fw-semibold" style={{ letterSpacing: '0.08em' }}>
                SHOP THE CAPSULE &rarr;
              </span>
            </div>
          </Link>

          {/* Card 2 */}
          <Link
            to="/products?category=fashion"
            className="promo-col-card"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80')` }}
          >
            <div className="promo-col-inner">
              <span className="text-uppercase small tracking-wider opacity-75 mb-1 d-block" style={{ fontSize: '0.72rem', letterSpacing: '0.15em' }}>
                ICONIC SILHOUETTES
              </span>
              <h3 className="fs-3 fw-normal mb-2" style={{ fontFamily: 'var(--font-editorial)' }}>
                Structured Outerwear
              </h3>
              <span className="text-white text-decoration-underline small fw-semibold" style={{ letterSpacing: '0.08em' }}>
                EXPLORE COATS &rarr;
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* =================================================================
          6. BEST SELLERS (Requirement 12)
          ================================================================= */}
      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
          <div>
            <span className="text-uppercase text-muted fw-semibold small tracking-wider" style={{ letterSpacing: '0.14em', fontSize: '0.72rem' }}>
              MOST COVETED
            </span>
            <h2 className="fs-2 fw-normal mb-0" style={{ fontFamily: 'var(--font-editorial)' }}>
              Best Sellers
            </h2>
          </div>
          <Link to="/products?sort=popular" className="text-secondary small text-decoration-none hover-dark" style={{ letterSpacing: '0.06em' }}>
            VIEW ALL BEST SELLERS &rarr;
          </Link>
        </div>

        <ProductGrid products={trendingProducts} loading={loading} />
      </section>

      {/* =================================================================
          7. TRUST & SERVICE BENEFITS (Requirement 18 - Nostra / Ref 1)
          ================================================================= */}
      <section className="container my-5">
        <div className="trust-benefits-grid">
          <div className="trust-benefit-item">
            <div className="trust-icon-box">
              <i className="bi bi-box-seam"></i>
            </div>
            <div>
              <h4 className="trust-title">Complimentary Shipping</h4>
              <p className="trust-desc">Enjoy free worldwide express shipping on orders over ₹999.</p>
            </div>
          </div>

          <div className="trust-benefit-item">
            <div className="trust-icon-box">
              <i className="bi bi-arrow-counterclockwise"></i>
            </div>
            <div>
              <h4 className="trust-title">30-Day Returns</h4>
              <p className="trust-desc">Effortless door-to-door returns with prepaid return shipping labels.</p>
            </div>
          </div>

          <div className="trust-benefit-item">
            <div className="trust-icon-box">
              <i className="bi bi-shield-check"></i>
            </div>
            <div>
              <h4 className="trust-title">Secure Checkout</h4>
              <p className="trust-desc">Encrypted payments via UPI, Cards, and EVM Web3 smart contracts.</p>
            </div>
          </div>

          <div className="trust-benefit-item">
            <div className="trust-icon-box">
              <i className="bi bi-chat-heart"></i>
            </div>
            <div>
              <h4 className="trust-title">Dedicated Concierge</h4>
              <p className="trust-desc">Our client advisory team is available 24/7 for styling and sizing assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          8. NEWSLETTER SIGNUP ("JOIN THE EDIT" - Requirement 19)
          ================================================================= */}
      <section className="newsletter-section-wrap">
        <div className="newsletter-inner">
          <span className="text-uppercase text-secondary fw-semibold small tracking-wider d-block mb-2" style={{ letterSpacing: '0.15em', fontSize: '0.72rem' }}>
            NEWSLETTER
          </span>
          <h2 className="display-6 fw-normal mb-2" style={{ fontFamily: 'var(--font-editorial)' }}>
            Join The Edit
          </h2>
          <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>
            Sign up for private sales, new arrivals, editorial lookbooks, and exclusive season previews.
          </p>

          {newsletterSubscribed ? (
            <div className="p-3 bg-white border text-success fw-medium small">
              <i className="bi bi-check-circle-fill me-2"></i> Thank you for subscribing. Lookbook sent to your inbox.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="newsletter-input-group">
              <input
                type="email"
                required
                className="newsletter-input"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                aria-label="Email address"
              />
              <button type="submit" className="newsletter-submit-btn">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
