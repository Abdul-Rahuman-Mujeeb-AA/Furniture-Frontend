import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  Armchair,
  BedDouble,
  ChevronRight,
  Flower2,
  Grid2X2,
  Layers3,
  Search,
  Shapes,
  Sofa,
  Sparkles,
  X,
} from "lucide-react";
import axios from "axios";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const API_URL =
  import.meta.env.VITE_API_URL

const CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85",
];

const CATEGORY_ICONS = [Sofa, BedDouble, Armchair, Flower2, Layers3, Shapes];

const CATEGORY_DESCRIPTIONS = [
  "Make room for comfort with inviting furniture for everyday living.",
  "Create a restful retreat with thoughtful bedroom essentials.",
  "Find comfortable seating for relaxing, working, and gathering.",
  "Add warmth and personality with carefully chosen home accents.",
  "Bring function and style together with versatile storage.",
  "Discover finishing touches that make your space feel personal.",
];

const CATEGORY_COLORS = [
  "bg-[#e8eee5] text-[#244c39]",
  "bg-[#f1e7db] text-[#79563d]",
  "bg-[#e8e8f0] text-[#4d507a]",
  "bg-[#f4ead0] text-[#86652a]",
  "bg-[#e7eee9] text-[#426c57]",
  "bg-[#eee7e0] text-[#795c48]",
];

function extractCategories(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.categories)) return data.data.categories;

  return [];
}

function getCategoryImage(category, index) {
  if (category?.image?.url) return category.image.url;

  if (typeof category?.image === "string" && category.image.trim()) {
    return category.image;
  }

  if (category?.imageUrl) return category.imageUrl;
  if (category?.images?.[0]?.url) return category.images[0].url;

  if (typeof category?.images?.[0] === "string") {
    return category.images[0];
  }

  return CATEGORY_IMAGES[index % CATEGORY_IMAGES.length];
}

function getErrorMessage(error) {
  if (error.code === "ERR_NETWORK") {
    return "Cannot connect to the backend. Check your Render deployment and backend CORS settings.";
  }

  return (
    error.response?.data?.message ||
    error.message ||
    "Unable to load categories. Please try again."
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function fetchCategories() {
      try {
        const response = await axios.get(`${API_URL}/categories`, {
          timeout: 20000,
        });

        if (active) {
          setCategories(extractCategories(response));
          setError("");
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      active = false;
    };
  }, [retryCount]);

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter((category) =>
      `${category.name || ""} ${category.description || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [categories, searchTerm]);

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setRetryCount((count) => count + 1);
  };

  const handleImageError = (event, index) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src =
      CATEGORY_IMAGES[index % CATEGORY_IMAGES.length];
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#18352b]">
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-[#18352b] text-white">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10 sm:h-96 sm:w-96" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full border border-white/10 sm:h-72 sm:w-72" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100 sm:text-xs">
                <Sparkles size={14} />
                The Furnispace collection
              </div>

              <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-7xl">
                Find your
                <span className="block font-serif font-normal italic text-[#d9c49a]">
                  kind of comfort.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/70 sm:text-base">
                Explore thoughtfully selected furniture and home essentials.
                Find the right pieces to make every corner feel like home.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#all-categories"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#e4d2aa] px-5 py-3 text-sm font-semibold text-[#18352b] transition hover:bg-white"
                >
                  Explore collections
                  <ArrowDownRight size={17} />
                </a>

                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Shop all products
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="mt-9 flex items-center gap-8 border-t border-white/15 pt-5">
                <div>
                  <p className="text-2xl font-semibold">
                    {loading ? "—" : categories.length}
                  </p>
                  <p className="mt-1 text-xs text-white/60">Collections</p>
                </div>
                <div className="h-10 w-px bg-white/15" />
                <div>
                  <p className="text-2xl font-semibold">Your style</p>
                  <p className="mt-1 text-xs text-white/60">
                    Your space, your way
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-3 rotate-3 rounded-4xl border border-white/10" />
              <div className="relative overflow-hidden rounded-3xl bg-[#344d3e]">
                <img
                  src={CATEGORY_IMAGES[0]}
                  alt="Contemporary furniture in a comfortable living room"
                  className="aspect-5/4 w-full object-cover sm:aspect-4/3 lg:aspect-5/4"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#10251c]/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e4d2aa]">
                    Designed for everyday living
                  </p>
                  <p className="mt-2 text-2xl font-medium sm:text-3xl">
                    A home that feels like you.
                  </p>
                  <a
                    href="#all-categories"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium hover:text-[#e4d2aa]"
                  >
                    Discover your style
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="all-categories" className="scroll-mt-24">
          <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 sm:pb-10 sm:pt-16 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">
                  Explore by collection
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Every room, considered.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                  Find furniture that complements your space, lifestyle, and
                  personal taste.
                </p>
              </div>

              <div className="relative w-full md:max-w-sm">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search categories..."
                  aria-label="Search categories"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-2">
              <Link
                to="/products"
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium transition hover:border-emerald-800 hover:text-emerald-900"
              >
                All products
              </Link>
              <span className="rounded-full bg-[#e7eee8] px-4 py-2 text-xs font-medium text-emerald-900">
                {loading
                  ? "Loading collections..."
                  : `${categories.length} collections available`}
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader />
            </div>
          ) : error ? (
            <div className="mx-auto max-w-2xl py-8">
              <ErrorMessage
                title="Unable to load categories"
                message={error}
                onRetry={handleRetry}
              />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center sm:px-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8eee5] text-emerald-900">
                <Search size={24} />
              </div>
              <h3 className="mt-5 text-xl font-semibold">
                {searchTerm ? "No categories found" : "No categories available"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {searchTerm
                  ? "Try another search term to find a collection."
                  : "Categories will appear here when they are available in the store."}
              </p>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-5 rounded-xl bg-[#18352b] px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {filteredCategories.length}
                  </span>{" "}
                  {filteredCategories.length === 1 ? "category" : "categories"}
                </p>
                <span className="hidden items-center gap-2 text-xs text-gray-500 sm:inline-flex">
                  <Grid2X2 size={15} />
                  Find your next favourite
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {filteredCategories.map((category, index) => {
                  const Icon = CATEGORY_ICONS[index % CATEGORY_ICONS.length];
                  const palette =
                    CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                  const categoryId = category._id || category.id;
                  const categoryName = category.name || "Furniture";
                  const description =
                    category.description?.trim() ||
                    CATEGORY_DESCRIPTIONS[index % CATEGORY_DESCRIPTIONS.length];

                  const productsUrl = categoryId
                    ? `/products?category=${encodeURIComponent(categoryId)}`
                    : "/products";

                  return (
                    <article
                      key={categoryId || categoryName}
                      className="group overflow-hidden rounded-2xl border border-gray-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-emerald-900/20 hover:shadow-xl hover:shadow-emerald-950/5 sm:rounded-3xl"
                    >
                      <Link
                        to={productsUrl}
                        aria-label={`Explore ${categoryName}`}
                        className="relative block overflow-hidden bg-[#e9eee6]"
                      >
                        <img
                          src={getCategoryImage(category, index)}
                          alt={categoryName}
                          loading="lazy"
                          onError={(event) => handleImageError(event, index)}
                          className="aspect-5/3 w-full object-cover transition duration-700 group-hover:scale-105 sm:aspect-4/3 lg:aspect-5/4"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />

                        <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
                          <span
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm ${palette}`}
                          >
                            <Icon size={21} strokeWidth={1.7} />
                          </span>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 sm:bottom-5 sm:left-5 sm:right-5">
                          <span className="rounded-full border border-white/30 bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                            Collection {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#18352b] transition group-hover:bg-[#e4d2aa]">
                            <ArrowDownRight size={19} />
                          </span>
                        </div>
                      </Link>

                      <div className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                            {categoryName}
                          </h3>
                          <ChevronRight
                            size={19}
                            className="mt-1 shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-emerald-800"
                          />
                        </div>

                        <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                          {description}
                        </p>

                        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                          <span className="text-xs text-gray-400">
                            Find your fit
                          </span>
                          <Link
                            to={productsUrl}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 transition hover:gap-3"
                          >
                            Explore
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#e9eee6] px-5 py-10 sm:px-10 sm:py-12 lg:px-14">
            <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border border-emerald-900/10 sm:h-72 sm:w-72" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
                  <Shapes size={15} />
                  Make yourself at home
                </div>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  Find the piece that brings it all together.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
                  Explore the full Furnispace collection and discover
                  furniture for the way you live.
                </p>
              </div>

              <Link
                to="/products"
                className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#18352b] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900 md:self-center"
              >
                Browse products
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
