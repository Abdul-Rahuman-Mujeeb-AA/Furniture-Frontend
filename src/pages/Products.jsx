import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  Armchair,
  Check,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import productService from "../services/productService";
import categoryService from "../services/categoryService";
import cartService from "../services/cartService";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductGrid from "../components/ProductGrid";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const getResponseItems = (response, key) => {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.categories)) return data.categories;

  return [];
};

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "object") {
    return String(value._id ?? value.id ?? "");
  }

  return String(value);
};

const getPrice = (product) =>
  Number(product?.discountPrice ?? product?.price ?? 0);

const getCategoryName = (category) =>
  typeof category === "object" && category !== null
    ? (category.name ?? "")
    : "";

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Unable to load products. Please try again.";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read search and category directly from the URL.
  const search = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const updateUrlFilters = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams);

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const handleSearchChange = (value) => {
    updateUrlFilters("search", value);
  };

  const handleCategoryChange = (value) => {
    updateUrlFilters("category", value);
  };

  const clearFilters = () => {
    setPriceRange("all");
    setSortBy("featured");
    setInStockOnly(false);
    setFiltersOpen(false);
    setSearchParams({}, { replace: true });
  };

  // Fetch products and categories.
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productResponse, categoryResponse] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
      ]);

      setProducts(getResponseItems(productResponse, "products"));
      setCategories(getResponseItems(categoryResponse, "categories"));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setError("");

      try {
        const [productResponse, categoryResponse] = await Promise.all([
          productService.getProducts(),
          categoryService.getCategories(),
        ]);

        if (!active) return;

        setProducts(getResponseItems(productResponse, "products"));
        setCategories(getResponseItems(categoryResponse, "categories"));
      } catch (requestError) {
        if (!active) return;

        setError(getErrorMessage(requestError));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  // Filter and sort products.
  const filteredProducts = useMemo(() => {
    let result = [...products];

    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const description = product.description?.toLowerCase() || "";
        const brand = product.brand?.toLowerCase() || "";
        const material = product.material?.toLowerCase() || "";
        const categoryName = getCategoryName(product.category).toLowerCase();

        return (
          name.includes(normalizedSearch) ||
          description.includes(normalizedSearch) ||
          brand.includes(normalizedSearch) ||
          material.includes(normalizedSearch) ||
          categoryName.includes(normalizedSearch)
        );
      });
    }

    if (selectedCategory) {
      result = result.filter(
        (product) => getId(product.category) === selectedCategory,
      );
    }

    if (priceRange === "under5000") {
      result = result.filter((product) => getPrice(product) < 5000);
    } else if (priceRange === "5000to15000") {
      result = result.filter((product) => {
        const price = getPrice(product);
        return price >= 5000 && price <= 15000;
      });
    } else if (priceRange === "above15000") {
      result = result.filter((product) => getPrice(product) > 15000);
    }

    if (inStockOnly) {
      result = result.filter((product) => Number(product.stock) > 0);
    }

    if (sortBy === "priceLow") {
      result.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortBy === "priceHigh") {
      result.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sortBy === "name") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );
    } else if (sortBy === "featured") {
      result.sort(
        (a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)),
      );
    }

    return result;
  }, [products, search, selectedCategory, priceRange, inStockOnly, sortBy]);

  // Add a product to the shopping cart.
  const handleAddToCart = async (product) => {
    if (!localStorage.getItem("token")) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    if (Number(product.stock) <= 0) {
      toast.error("This product is currently out of stock.");
      return;
    }

    const productId = getId(product);

    if (!productId) {
      toast.error("Unable to identify this product.");
      return;
    }

    try {
      await cartService.addToCart(productId, 1);
      toast.success(`${product.name} added to your cart.`);
    } catch (requestError) {
      toast.error(
        requestError?.response?.data?.message ||
          "Unable to add this product to your cart.",
      );
    }
  };

  const activeFilterCount =
    Number(Boolean(selectedCategory)) +
    Number(priceRange !== "all") +
    Number(inStockOnly);

  return (
    <div className="min-h-screen bg-[#f8f8f5] text-[#18352b]">
      <Navbar />

      <main>
        {/* Hero section */}
        <section className="relative overflow-hidden bg-[#18352b]">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10 sm:h-96 sm:w-96" />
          <div className="absolute -right-8 -top-12 h-56 w-56 rounded-full border border-white/10 sm:h-72 sm:w-72" />

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium tracking-wide text-emerald-100">
                <Sparkles size={14} />
                THOUGHTFULLY DESIGNED LIVING
              </div>

              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl">
                Furniture that
                <br />
                <span className="font-light italic text-emerald-200">
                  feels like home.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-emerald-50/75 sm:text-base">
                Discover timeless pieces, considered materials, and everyday
                comfort designed to make your space your own.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-200" />
                  Made for everyday living
                </span>

                <span className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-200" />
                  Styles for every room
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Search and categories */}
        <section className="mx-auto max-w-7xl px-4 pt-7 sm:px-6 sm:pt-10 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                THE COLLECTION
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Find your perfect piece
              </h2>
            </div>

            <div className="relative w-full lg:max-w-md">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search furniture, materials, styles..."
                aria-label="Search products"
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-11 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => handleCategoryChange("")}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                !selectedCategory
                  ? "bg-[#18352b] text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-emerald-700 hover:text-emerald-800"
              }`}
            >
              All furniture
            </button>

            {categories.map((category) => {
              const categoryId = getId(category);
              const active = selectedCategory === categoryId;

              return (
                <button
                  key={categoryId}
                  type="button"
                  onClick={() => handleCategoryChange(categoryId)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[#18352b] text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-emerald-700 hover:text-emerald-800"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Products and filters */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-5">
            <div>
              <h2 className="text-lg font-semibold sm:text-xl">
                {selectedCategory
                  ? categories.find(
                      (category) => getId(category) === selectedCategory,
                    )?.name || "Selected category"
                  : "Explore all furniture"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {loading
                  ? "Finding the right pieces for you..."
                  : `${filteredProducts.length} ${
                      filteredProducts.length === 1 ? "piece" : "pieces"
                    } to discover`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium hover:border-emerald-700 lg:hidden"
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-emerald-800 px-2 py-0.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm">
                <ArrowDownWideNarrow size={16} className="text-gray-500" />

                <span className="hidden text-gray-500 sm:inline">Sort:</span>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="max-w-36 bg-transparent font-medium outline-none"
                  aria-label="Sort products"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="priceLow">Price: Low to high</option>
                  <option value="priceHigh">Price: High to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
            {/* Filters sidebar */}
            <aside
              className={`${
                filtersOpen ? "block" : "hidden"
              } h-fit rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-24 lg:block`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filter products</h3>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-emerald-800 hover:underline"
                >
                  Clear all
                </button>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <h4 className="text-sm font-semibold">Price range</h4>

                <div className="mt-3 space-y-3">
                  {[
                    { value: "all", label: "All prices" },
                    { value: "under5000", label: "Under ₹5,000" },
                    { value: "5000to15000", label: "₹5,000 – ₹15,000" },
                    { value: "above15000", label: "Above ₹15,000" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 text-sm text-gray-600"
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        value={option.value}
                        checked={priceRange === option.value}
                        onChange={() => setPriceRange(option.value)}
                        className="h-4 w-4 accent-emerald-800"
                      />

                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <h4 className="text-sm font-semibold">Availability</h4>

                <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(event) => setInStockOnly(event.target.checked)}
                    className="h-4 w-4 rounded accent-emerald-800"
                  />
                  In-stock items only
                </label>
              </div>

              <div className="mt-6 rounded-xl bg-[#f3f6f1] p-4">
                <Armchair size={22} className="text-emerald-800" />

                <p className="mt-3 text-sm font-semibold">
                  Make room for better.
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Find practical pieces that bring comfort and character to your
                  home.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="mt-5 w-full rounded-xl bg-[#18352b] px-4 py-3 text-sm font-medium text-white hover:bg-emerald-900 lg:hidden"
              >
                Show {filteredProducts.length} results
              </button>
            </aside>

            {/* Product results */}
            <div className="min-w-0">
              {error ? (
                <ErrorMessage
                  title="Couldn't load the collection"
                  message={error}
                  onRetry={loadProducts}
                />
              ) : loading ? (
                <div className="flex min-h-72 items-center justify-center">
                  <Loader />
                </div>
              ) : filteredProducts.length > 0 ? (
                <ProductGrid
                  products={filteredProducts}
                  loading={false}
                  onAddToCart={handleAddToCart}
                />
              ) : (
                <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f4ee] text-emerald-800">
                    <Search size={27} />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold">
                    No furniture found
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                    Try a different search, choose another category, or clear
                    your filters to see more products.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#18352b] px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-900"
                  >
                    Clear filters
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Closing banner */}
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#e9eee5] p-7 sm:p-10 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                YOUR HOME, YOUR WAY
              </p>

              <h2 className="mt-3 max-w-xl text-2xl font-semibold leading-tight sm:text-3xl">
                Small details. Meaningful spaces.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                Explore furniture made to complement your everyday moments.
              </p>
            </div>

            <Link
              to="/categories"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#18352b] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-emerald-900"
            >
              Browse categories
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}