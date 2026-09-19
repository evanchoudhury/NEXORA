import React from 'react';

export default function FilterPanel({
  categories = [],
  selectedCategory,
  onSelectCategory,
  priceRange,
  onChangePriceRange,
  minRating,
  onChangeMinRating,
  inStockOnly,
  onToggleInStock,
  sortBy,
  onChangeSort,
  onResetFilters
}) {
  return (
    <aside className="p-4 rounded-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)' }} aria-label="Product Filters">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary" style={{ borderColor: 'var(--surface-border-subtle)' }}>
        <h5 className="mb-0 fs-6 text-uppercase fw-bold tracking-wider text-white">
          <i className="bi bi-sliders me-2 text-primary"></i> Filters
        </h5>
        <button
          onClick={onResetFilters}
          className="btn btn-sm text-secondary hover-primary p-0 text-decoration-underline"
          style={{ fontSize: '0.8rem' }}
        >
          Reset All
        </button>
      </div>

      {/* Sort By */}
      <div className="mb-4">
        <label className="form-label text-secondary small fw-semibold text-uppercase">Sort By</label>
        <select
          className="form-select form-select-sm nexora-input"
          value={sortBy}
          onChange={(e) => onChangeSort(e.target.value)}
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <label className="form-label text-secondary small fw-semibold text-uppercase mb-2">Categories</label>
        <div className="d-flex flex-column gap-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`btn btn-sm text-start py-1 px-2 rounded-2 text-truncate ${!selectedCategory ? 'bg-primary text-white fw-semibold' : 'text-secondary hover-primary'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`btn btn-sm text-start py-1 px-2 rounded-2 text-truncate d-flex justify-content-between align-items-center ${selectedCategory === cat.slug ? 'bg-primary text-white fw-semibold' : 'text-secondary hover-primary'}`}
            >
              <span>{cat.name}</span>
              <span className="badge rounded-pill bg-dark text-muted small" style={{ fontSize: '0.7rem' }}>
                {cat.product_count || ''}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <label className="form-label text-secondary small fw-semibold text-uppercase">
          Max Price: <span className="text-white fw-bold">₹{Number(priceRange).toLocaleString('en-IN')}</span>
        </label>
        <input
          type="range"
          className="form-range"
          min="1000"
          max="80000"
          step="1000"
          value={priceRange}
          onChange={(e) => onChangePriceRange(Number(e.target.value))}
        />
        <div className="d-flex justify-content-between text-muted small">
          <span>₹1,000</span>
          <span>₹80,000</span>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="mb-4">
        <label className="form-label text-secondary small fw-semibold text-uppercase mb-2">Minimum Rating</label>
        <div className="d-flex gap-2">
          {[0, 4, 4.5, 4.8].map((stars) => (
            <button
              key={stars}
              onClick={() => onChangeMinRating(stars)}
              className={`btn btn-sm flex-fill rounded-2 ${minRating === stars ? 'btn-primary' : 'btn-outline-secondary text-secondary'}`}
              style={{ fontSize: '0.75rem' }}
            >
              {stars === 0 ? 'Any' : `${stars}★+`}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Only Toggle */}
      <div className="form-check form-switch mt-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="inStockCheck"
          checked={inStockOnly}
          onChange={(e) => onToggleInStock(e.target.checked)}
        />
        <label className="form-check-label text-light small fw-medium" htmlFor="inStockCheck">
          In-Stock Items Only
        </label>
      </div>
    </aside>
  );
}
