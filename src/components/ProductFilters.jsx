import { useState } from "react";
import {
  FiSearch,
  FiSliders,
  FiX,
  FiRotateCcw,
  FiCheck,
  FiPackage,
  FiDollarSign,
  FiLayers,
  FiArrowUpDown,
} from "react-icons/fi";

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
];

const DEFAULT_FILTERS = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  sort: "featured",
  inStock: false,
};

function ProductFilters({
  categories = [],
  filters = {},
  onFilterChange,
  onClearFilters,
  resultCount,
  className = "",
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentFilters = {
    ...DEFAULT_FILTERS,
    ...filters,
  };

  const updateFilter = (name, value) => {
    onFilterChange?.({
      ...currentFilters,
      [name]: value,
    });
  };

  const activeFilterCount = [
    currentFilters.search.trim(),
    currentFilters.category,
    currentFilters.minPrice,
    currentFilters.maxPrice,
    currentFilters.inStock ? "inStock" : "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      onFilterChange?.({ ...DEFAULT_FILTERS });
    }

    setMobileOpen(false);
  };

  const categoryList = categories.map((category) => ({
    id: String(category._id || category.id || category.name),
    name: category.name,
  }));

  const closeMobileFilters = () => setMobileOpen(false);

  const filterContent = (
    <div className="space-y-6">
      {/* Search */}
      <section>
        <label
          htmlFor="product-filter-search"
          className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-stone-800"
        >
          <FiSearch className="text-emerald-700" />
          Find your furniture
        </label>

        <div className="relative">
          <FiSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
          />

          <input
            id="product-filter-search"
            type="search"
            value={currentFilters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Try sofa, table, chair..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
          />
        </div>
      </section>

      <div className="h-px bg-stone-100" />

      {/* Categories */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-800">
          <FiLayers className="text-emerald-700" />
          Categories
        </h3>

        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => updateFilter("category", "")}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
              !currentFilters.category
                ? "bg-emerald-50 font-semibold text-emerald-800"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            }`}
          >
            <span>All furniture</span>
            {!currentFilters.category && (
              <FiCheck aria-hidden="true" className="text-emerald-700" />
            )}
          </button>

          {categoryList.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => updateFilter("category", category.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                currentFilters.category === category.id
                  ? "bg-emerald-50 font-semibold text-emerald-800"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <span>{category.name}</span>

              {currentFilters.category === category.id && (
                <FiCheck aria-hidden="true" className="text-emerald-700" />
              )}
            </button>
          ))}
        </div>
      </section>

      <div className="h-px bg-stone-100" />

      {/* Price range */}
      <section>
        <h3 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-stone-800">
          <FiDollarSign className="text-emerald-700" />
          Price range
        </h3>

        <p className="mb-3 text-xs leading-5 text-stone-500">
          Set a budget that works for your space.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="product-min-price"
              className="mb-1.5 block text-xs font-medium text-stone-500"
            >
              Minimum (₹)
            </label>

            <input
              id="product-min-price"
              type="number"
              min="0"
              value={currentFilters.minPrice}
              onChange={(event) => updateFilter("minPrice", event.target.value)}
              placeholder="0"
              className="w-full min-w-0 rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
            />
          </div>

          <div>
            <label
              htmlFor="product-max-price"
              className="mb-1.5 block text-xs font-medium text-stone-500"
            >
              Maximum (₹)
            </label>

            <input
              id="product-max-price"
              type="number"
              min="0"
              value={currentFilters.maxPrice}
              onChange={(event) => updateFilter("maxPrice", event.target.value)}
              placeholder="Any"
              className="w-full min-w-0 rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
            />
          </div>
        </div>
      </section>

      <div className="h-px bg-stone-100" />

      {/* Availability */}
      <section>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl p-1">
          <input
            type="checkbox"
            checked={Boolean(currentFilters.inStock)}
            onChange={(event) => updateFilter("inStock", event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-emerald-700 focus:ring-emerald-600"
          />

          <span>
            <span className="block text-sm font-semibold text-stone-800">
              In-stock items only
            </span>
            <span className="mt-1 block text-xs text-stone-500">
              Show furniture ready to order.
            </span>
          </span>
        </label>
      </section>

      {/* Actions */}
      <div className="space-y-3 border-t border-stone-100 pt-5">
        <button
          type="button"
          onClick={closeMobileFilters}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900 lg:hidden"
        >
          <FiCheck aria-hidden="true" />
          Show {typeof resultCount === "number" ? resultCount : ""} products
        </button>

        <button
          type="button"
          onClick={clearFilters}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-600 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900"
        >
          <FiRotateCcw aria-hidden="true" />
          Clear all filters
        </button>
      </div>
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile toolbar */}
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-product-filters"
          className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-emerald-700"
        >
          <FiSliders aria-hidden="true" className="text-emerald-700" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-800 px-1.5 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <FiPackage aria-hidden="true" className="shrink-0 text-stone-400" />
          <span className="truncate text-sm text-stone-500">
            {typeof resultCount === "number"
              ? `${resultCount} products`
              : "Browse collection"}
          </span>
        </div>
      </div>

      {/* Sort dropdown */}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-3 py-3 sm:px-4">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
          <FiArrowUpDown
            aria-hidden="true"
            className="shrink-0 text-emerald-700"
          />
          <label htmlFor="product-sort">Sort by</label>
        </div>

        <select
          id="product-sort"
          value={currentFilters.sort}
          onChange={(event) => updateFilter("sort", event.target.value)}
          className="max-w-[65%] rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 sm:max-w-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm lg:block xl:p-6">
        <div className="mb-6 flex items-start justify-between gap-2">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <FiSliders aria-hidden="true" className="text-emerald-700" />
              <h2 className="text-lg font-bold tracking-tight text-stone-900">
                Refine your search
              </h2>
            </div>

            <p className="text-xs text-stone-500">
              Find the right fit for your home.
            </p>
          </div>

          {activeFilterCount > 0 && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              {activeFilterCount} active
            </span>
          )}
        </div>

        {filterContent}
      </aside>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={closeMobileFilters}
            className="absolute inset-0 h-full w-full bg-stone-950/50 backdrop-blur-[2px]"
          />

          <section
            id="mobile-product-filters"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-[#faf9f6] shadow-2xl sm:max-w-md"
          >
            <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4">
              <div>
                <h2
                  id="mobile-filter-title"
                  className="text-lg font-bold text-stone-900"
                >
                  Refine your search
                </h2>

                <p className="mt-0.5 text-xs text-stone-500">
                  Find furniture that fits your home.
                </p>
              </div>

              <button
                type="button"
                onClick={closeMobileFilters}
                aria-label="Close filter panel"
                className="rounded-full border border-stone-200 p-2.5 text-stone-600 transition hover:bg-stone-100"
              >
                <FiX aria-hidden="true" size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">{filterContent}</div>
          </section>
        </div>
      )}
    </div>
  );
}

export default ProductFilters;