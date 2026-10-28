
import { FiPackage, FiSearch } from "react-icons/fi";
import ProductCard from "./ProductCard";

function ProductGrid({
  products = [],
  loading = false,
  error = "",
  onRetry,
  onAddToCart,
  onToggleWishlist,
  wishlistedProducts = [],
  title = "Explore Our Collection",
  subtitle = "Thoughtfully selected furniture for every corner of your home.",
  showHeading = true,
}) {
  const wishlistedIds = new Set(
    wishlistedProducts.map((item) =>
      typeof item === "string" ? item : item?._id
    )
  );

  // Loading state
  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {showHeading && (
          <div className="mb-7">
            <div className="h-3 w-28 animate-pulse rounded bg-stone-200" />
            <div className="mt-3 h-8 w-64 max-w-full animate-pulse rounded-lg bg-stone-200" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
            >
              <div className="aspect-4/3 animate-pulse bg-stone-200" />
              <div className="space-y-3 p-3 sm:p-4">
                <div className="h-3 w-1/3 animate-pulse rounded bg-stone-200" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-stone-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-stone-200" />
                <div className="h-10 animate-pulse rounded-xl bg-stone-100" />
              </div>
            </div>
          ))}
        </div>

        <p className="sr-only" role="status">
          Loading furniture products...
        </p>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div
          className="mx-auto max-w-xl rounded-3xl border border-red-100 bg-white px-6 py-10 text-center shadow-sm sm:px-10"
          role="alert"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-600">
            <FiPackage />
          </div>

          <h2 className="mt-5 text-xl font-bold text-emerald-950 sm:text-2xl">
            We couldn't load the collection
          </h2>

          <p className="mt-3 wrap-break-words text-sm leading-6 text-stone-500 sm:text-base">
            {error}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
            >
              Try Again
            </button>
          )}
        </div>
      </section>
    );
  }

  // Empty state
  if (!products.length) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-lg rounded-3xl border border-stone-200 bg-white px-6 py-10 text-center sm:px-10 sm:py-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3f0e9] text-3xl text-emerald-950">
            <FiSearch />
          </div>

          <h2 className="mt-5 text-xl font-bold text-emerald-950 sm:text-2xl">
            No furniture found
          </h2>

          <p className="mt-3 text-sm leading-6 text-stone-500 sm:text-base">
            There are no products to display right now. Try changing your
            filters or check back later for new arrivals.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      {/* Section heading */}
      {showHeading && (
        <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-800 sm:text-xs">
              <span className="h-px w-6 bg-amber-700" />
              Made for your home
            </span>

            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl lg:text-4xl">
              {title}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500 sm:text-base sm:leading-7">
              {subtitle}
            </p>
          </div>

          <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 sm:text-sm">
            <FiPackage className="text-emerald-900" />
            {products.length} {products.length === 1 ? "item" : "items"}
          </span>
        </div>
      )}

      {/* Responsive product cards */}
      <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            isWishlisted={wishlistedIds.has(product._id)}
          />
        ))}
      </div>
    </section>
  );
}

export default ProductGrid;
