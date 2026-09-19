import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import ProductGrid from '../components/ProductGrid';
import FilterPanel from '../components/FilterPanel';
import CategoryPills from '../components/CategoryPills';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [gridDensity, setGridDensity] = useState('comfortable'); // 'comfortable' (3 cols) or 'compact' (4 cols)

  // Filters state from query params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const [priceRange, setPriceRange] = useState(80000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(search);

  // Fetch categories once
  useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res?.data?.categories) setCategories(res.data.categories);
      })
      .catch(console.error);
  }, []);

  // Sync search input with searchParam
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Fetch products on filter changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          search,
          category,
          maxPrice: priceRange,
          rating: minRating > 0 ? minRating : undefined,
          inStock: inStockOnly || undefined,
          sort: sortBy,
          page,
          limit: gridDensity === 'compact' ? 16 : 12,
        };

        const res = await api.getProducts(params);
        if (res?.data?.products) {
          setProducts(res.data.products);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Error loading products catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, priceRange, minRating, inStockOnly, sortBy, page, gridDensity]);

  const handleSelectCategory = (catSlug) => {
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (catSlug) {
      newParams.set('category', catSlug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setPriceRange(80000);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('newest');
    setPage(1);
    setSearchInput('');
    setSearchParams({});
  };

  // Build active category name for header
  const activeCategoryObj = categories.find((c) => c.slug === category);
  const activeCategoryTitle = activeCategoryObj ? activeCategoryObj.name : 'All Creations';

  return (
    <div className="container py-4 py-lg-5">
      {/* Editorial Breadcrumb & Title */}
      <div className="mb-4">
        <nav aria-label="breadcrumb" className="mb-2">
          <ol className="breadcrumb small text-uppercase" style={{ letterSpacing: '0.08em', fontSize: '0.72rem' }}>
            <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Shop</li>
            {category && <li className="breadcrumb-item active text-dark fw-semibold">{activeCategoryTitle}</li>}
          </ol>
        </nav>

        <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 border-bottom pb-3" style={{ borderColor: 'var(--surface-border)' }}>
          <div>
            <h1 className="display-4 fw-normal text-dark mb-0" style={{ fontFamily: 'var(--font-editorial)', letterSpacing: '0.04em' }}>
              {category ? activeCategoryTitle.toUpperCase() : search ? `SEARCH: "${search.toUpperCase()}"` : 'ALL PRODUCTS'}
            </h1>
          </div>
          <div className="text-secondary small">
            Showing {products.length} {products.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>

      {/* Category Tabs (Nanushka Style) */}
      <CategoryPills
        categories={categories}
        selectedCategory={category}
        onSelectCategory={handleSelectCategory}
        totalProductsCount={pagination.total || 32}
      />

      {/* Filter & Sort Utility Bar */}
      <div className="p-3 mb-4 rounded-1 border bg-white" style={{ borderColor: 'var(--surface-border)' }}>
        <div className="row g-3 align-items-center justify-content-between">
          {/* Quick Search */}
          <div className="col-12 col-md-5 col-lg-4">
            <form onSubmit={handleSearchSubmit} className="search-input-wrap">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                placeholder="Search by title, brand, spec..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="form-control form-control-sm catalog-search-input"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="btn-clear-search"
                  aria-label="Clear search"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </form>
          </div>

          {/* Quick Filters: In Stock & Sort & Density Switcher */}
          <div className="col-12 col-md-7 col-lg-8 d-flex align-items-center justify-content-md-end gap-2 flex-wrap">
            {/* In Stock Only Toggle */}
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`btn btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1.5 ${
                inStockOnly
                  ? 'btn-primary text-white'
                  : 'btn-outline-secondary text-secondary'
              }`}
            >
              <i className={`bi ${inStockOnly ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
              In Stock Only
            </button>

            {/* Sort Selector */}
            <div className="d-flex align-items-center gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select form-select-sm sort-select rounded-pill px-3"
                aria-label="Sort products by"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Customer Rating</option>
              </select>
            </div>

            {/* Grid Density Switcher */}
            <div className="btn-group btn-group-sm density-switcher" role="group" aria-label="Grid density">
              <button
                type="button"
                onClick={() => setGridDensity('comfortable')}
                className={`btn btn-outline-secondary ${gridDensity === 'comfortable' ? 'active' : ''}`}
                title="Comfortable (3 columns)"
              >
                <i className="bi bi-grid-3x3-gap-fill"></i>
              </button>
              <button
                type="button"
                onClick={() => setGridDensity('compact')}
                className={`btn btn-outline-secondary ${gridDensity === 'compact' ? 'active' : ''}`}
                title="Compact (4 columns)"
              >
                <i className="bi bi-grid-fill"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(category || search || inStockOnly || priceRange < 80000 || minRating > 0) && (
          <div className="active-filter-chips mt-3 pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center gap-2 flex-wrap">
            <span className="text-secondary small me-1">Active filters:</span>

            {category && (
              <span className="filter-chip">
                Category: {activeCategoryTitle}
                <button onClick={() => handleSelectCategory('')} aria-label="Remove category filter">
                  <i className="bi bi-x"></i>
                </button>
              </span>
            )}

            {search && (
              <span className="filter-chip">
                Search: "{search}"
                <button onClick={handleClearSearch} aria-label="Remove search filter">
                  <i className="bi bi-x"></i>
                </button>
              </span>
            )}

            {inStockOnly && (
              <span className="filter-chip">
                In Stock Only
                <button onClick={() => setInStockOnly(false)} aria-label="Remove in stock filter">
                  <i className="bi bi-x"></i>
                </button>
              </span>
            )}

            {priceRange < 80000 && (
              <span className="filter-chip">
                Under ₹{priceRange.toLocaleString('en-IN')}
                <button onClick={() => setPriceRange(80000)} aria-label="Remove price filter">
                  <i className="bi bi-x"></i>
                </button>
              </span>
            )}

            {minRating > 0 && (
              <span className="filter-chip">
                {minRating}★ & Up
                <button onClick={() => setMinRating(0)} aria-label="Remove rating filter">
                  <i className="bi bi-x"></i>
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="btn btn-link text-secondary text-decoration-none small p-0 ms-auto"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Left Column: Filter Sidebar */}
        <div className="col-lg-3">
          <FilterPanel
            categories={categories}
            selectedCategory={category}
            onSelectCategory={handleSelectCategory}
            priceRange={priceRange}
            onChangePriceRange={setPriceRange}
            minRating={minRating}
            onChangeMinRating={setMinRating}
            inStockOnly={inStockOnly}
            onToggleInStock={setInStockOnly}
            sortBy={sortBy}
            onChangeSort={setSortBy}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Right Column: Product Grid & Pagination */}
        <div className="col-lg-9">
          <ProductGrid
            products={products}
            loading={loading}
            density={gridDensity}
            onResetFilters={handleResetFilters}
          />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              >
                <i className="bi bi-chevron-left me-1"></i> Prev
              </button>

              <span className="text-secondary small mx-2">
                Page <strong className="text-white">{pagination.page}</strong> of {pagination.totalPages}
              </span>

              <button
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              >
                Next <i className="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
