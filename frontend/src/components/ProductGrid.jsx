import React, { useState } from 'react';
import ProductCard from './ProductCard';
import ProductQuickViewModal from './ProductQuickViewModal';

export default function ProductGrid({
  products,
  loading,
  density = 'comfortable', // 'comfortable' (3 cols on desktop) or 'compact' (4 cols on desktop)
  emptyMessage = 'No products found matching your criteria.',
  onResetFilters,
}) {
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  if (loading) {
    return (
      <div className={`product-grid-container grid-density-${density}`}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="product-card p-3 placeholder-glow">
            <div
              className="placeholder w-100 mb-3 rounded-3"
              style={{ height: '240px', background: '#1c263c' }}
            ></div>
            <div className="placeholder col-4 mb-2" style={{ background: '#243352' }}></div>
            <div className="placeholder col-10 mb-2" style={{ background: '#243352' }}></div>
            <div className="placeholder col-6 mb-3" style={{ background: '#243352' }}></div>
            <div className="d-flex justify-content-between align-items-center mt-auto">
              <div className="placeholder col-4" style={{ background: '#243352' }}></div>
              <div className="placeholder col-3 btn" style={{ background: '#243352' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div
        className="text-center py-5 my-4 p-4 rounded-4"
        style={{
          background: 'var(--surface-card)',
          border: '1px dashed var(--surface-border)',
        }}
      >
        <div className="mb-3">
          <i
            className="bi bi-search fs-1"
            style={{ color: 'var(--primary-color)', opacity: 0.7 }}
          ></i>
        </div>
        <h5 className="text-white mb-2">No Products Found</h5>
        <p className="text-secondary small mb-3">{emptyMessage}</p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i> Reset All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <section
        className={`product-grid-container grid-density-${density}`}
        aria-label="Product Catalog Grid"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        ))}
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
