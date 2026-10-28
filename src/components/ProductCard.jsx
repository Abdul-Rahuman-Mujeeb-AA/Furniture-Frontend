import { Link } from "react-router-dom";
import {
  FiShoppingBag,
  FiArrowUpRight,
  FiHeart,
} from "react-icons/fi";

function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted = false }) {
  if (!product) return null;

  const {
    _id,
    name,
    description,
    price,
    discountPrice,
    brand,
    material,
    color,
    stock,
    images = [],
    isFeatured,
  } = product;

  const productId = _id;
  const imageUrl = images?.[0]?.url;
  const hasDiscount =
    typeof discountPrice === "number" &&
    discountPrice > 0 &&
    discountPrice < price;

  const displayPrice = hasDiscount ? discountPrice : price;

  const discountPercentage = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const isOutOfStock = typeof stock === "number" && stock <= 0;

  const formattedPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount ?? 0);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_18px_45px_rgba(23,59,43,0.10)] sm:rounded-3xl">
      {/* Product image */}
      <div className="relative aspect-4/3 overflow-hidden bg-[#f3f0e9] sm:aspect-4/3">
        <Link
          to={`/products/${productId}`}
          aria-label={`View ${name}`}
          className="block h-full w-full"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-stone-400">
              <FiShoppingBag className="text-3xl" />
              <span className="text-xs">Image unavailable</span>
            </div>
          )}
        </Link>

        {/* Product labels */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
          {isFeatured && (
            <span className="rounded-full bg-emerald-950 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white sm:text-[10px]">
              Featured
            </span>
          )}

          {hasDiscount && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-bold text-amber-900 sm:text-[10px]">
              Save {discountPercentage}%
            </span>
          )}

          {isOutOfStock && (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[9px] font-bold text-red-700 sm:text-[10px]">
              Out of stock
            </span>
          )}
        </div>

        {/* Wishlist button */}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={() => onToggleWishlist(product)}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            aria-pressed={isWishlisted}
            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition sm:right-4 sm:top-4 ${
              isWishlisted
                ? "bg-rose-100 text-rose-600"
                : "bg-white/90 text-stone-700 hover:bg-white hover:text-rose-600"
            }`}
          >
            <FiHeart
              className={`text-lg ${isWishlisted ? "fill-current" : ""}`}
            />
          </button>
        )}

        {/* Quick view link */}
        <Link
          to={`/products/${productId}`}
          className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white text-emerald-950 opacity-0 shadow-md transition duration-300 hover:bg-emerald-950 hover:text-white group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100 sm:bottom-4 sm:right-4"
          aria-label={`View details for ${name}`}
        >
          <FiArrowUpRight className="text-lg" />
        </Link>
      </div>

      {/* Product details */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4 lg:p-5">
        <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-amber-800 sm:text-[11px]">
            {brand || "Furnispace Collection"}
          </span>

          {material && (
            <span className="max-w-[45%] truncate rounded-full bg-stone-100 px-2 py-1 text-[10px] text-stone-500 sm:text-xs">
              {material}
            </span>
          )}
        </div>

        <Link to={`/products/${productId}`} className="block">
          <h3 className="line-clamp-2 min-h-11 text-sm font-bold leading-5 text-emerald-950 transition group-hover:text-amber-800 sm:min-h-12 sm:text-base sm:leading-6">
            {name}
          </h3>
        </Link>

        {description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-stone-500 sm:text-sm">
            {description}
          </p>
        )}

        {/* Color information */}
        {color && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] text-stone-500 sm:text-xs">
              Color:
            </span>
            <span className="truncate text-[11px] font-medium text-stone-700 sm:text-xs">
              {color}
            </span>
          </div>
        )}

        {/* Price and action */}
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
            <span className="text-base font-extrabold tracking-tight text-emerald-950 sm:text-lg">
              {formattedPrice(displayPrice)}
            </span>

            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through sm:text-sm">
                {formattedPrice(price)}
              </span>
            )}
          </div>

          <div className="mt-3">
            {onAddToCart ? (
              <button
                type="button"
                onClick={() => onAddToCart(product)}
                disabled={isOutOfStock}
                className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-950 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300 sm:min-h-11 sm:text-sm"
              >
                <FiShoppingBag className="text-base" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
            ) : (
              <Link
                to={`/products/${productId}`}
                className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-950/15 px-3 py-2.5 text-xs font-bold text-emerald-950 transition hover:border-emerald-950 hover:bg-emerald-950 hover:text-white sm:min-h-11 sm:text-sm"
              >
                View Details <FiArrowUpRight className="text-base" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
