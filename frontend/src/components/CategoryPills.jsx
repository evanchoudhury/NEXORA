import React, { useRef } from 'react';

export default function CategoryPills({
  categories = [],
  selectedCategory = '',
  onSelectCategory,
  categoryCounts = {},
  totalProductsCount = 0,
}) {
  const scrollRef = useRef(null);

  return (
    <div className="editorial-tabs-wrap" ref={scrollRef} role="tablist">
      {/* 'All Products' Tab */}
      <button
        role="tab"
        aria-selected={!selectedCategory}
        onClick={() => onSelectCategory('')}
        className={`editorial-tab-btn ${!selectedCategory ? 'active' : ''}`}
      >
        <span>All Products</span>
        {totalProductsCount > 0 && (
          <span className="ms-1.5 opacity-60 small">({totalProductsCount})</span>
        )}
      </button>

      {/* Dynamic Category Tabs */}
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.slug;
        const count = categoryCounts[cat.slug] ?? cat.product_count;

        return (
          <button
            key={cat.id || cat.slug}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectCategory(cat.slug)}
            className={`editorial-tab-btn ${isActive ? 'active' : ''}`}
          >
            <span>{cat.name}</span>
            {count !== undefined && count !== null && (
              <span className="ms-1.5 opacity-60 small">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
