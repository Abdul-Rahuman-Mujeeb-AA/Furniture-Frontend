import { Link } from "react-router-dom";
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiPackage,
  FiAlertCircle,
} from "react-icons/fi";

function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  updating = false,
}) {
  // Supports cart items containing either a product object or product ID.
  const product =
    item?.product && typeof item.product === "object"
      ? item.product
      : item;

  if (!product) return null;

  const productId =
    typeof item?.product === "object"
      ? item.product?._id
      : item?.product || product?._id;

  const name = product.name || "Furniture product";
  const image = product.images?.[0]?.url || "";
  const price = Number(product.discountPrice ?? product.price ?? 0);
  const originalPrice = Number(product.price ?? 0);

  const quantity = Math.max(1, Number(item.quantity) || 1);
  const stock = Number(product.stock ?? 0);
  const hasStockInformation = product.stock !== undefined &&
    product.stock !== null;
  const maxQuantity = hasStockInformation
    ? Math.max(0, stock)
    : Infinity;

  const lineTotal = price * quantity;
  const hasDiscount =
    product.discountPrice != null &&
    Number(product.discountPrice) > 0 &&
    Number(product.discountPrice) < originalPrice;

  const canDecrease = quantity > 1 && !updating;
  const canIncrease =
    !updating &&
    (!hasStockInformation || quantity < maxQuantity);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const handleQuantityChange = (nextQuantity) => {
    if (!productId || updating) return;
    if (nextQuantity < 1) return;
    if (hasStockInformation && nextQuantity > maxQuantity) return;

    onUpdateQuantity?.(productId, nextQuantity);
  };

  const handleRemove = () => {
    if (!productId || updating) return;
    onRemove?.(productId);
  };

  return (
    <article className="group relative rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm transition hover:border-stone-300 hover:shadow-md sm:p-4 md:rounded-3xl md:p-5">
      <div className="flex min-w-0 gap-3 sm:gap-5">
        {/* Product image */}
        <Link
          to={productId ? `/products/${productId}` : "/products"}
          aria-label={`View ${name}`}
          className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f3f0e9] sm:h-36 sm:w-32 md:h-40 md:w-36 md:rounded-2xl"
        >
          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105 sm:p-3"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-stone-400">
              <FiPackage size={28} />
              <span className="px-1 text-center text-[10px]">
                No image
              </span>
            </div>
          )}

          {hasDiscount && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-emerald-800 px-2 py-1 text-[10px] font-bold text-white sm:left-2 sm:top-2 sm:text-xs">
              SALE
            </span>
          )}
        </Link>

        {/* Product details */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {product.brand && (
                <p className="mb-1 truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-800 sm:text-xs">
                  {product.brand}
                </p>
              )}

              <Link
                to={productId ? `/products/${productId}` : "/products"}
                className="line-clamp-2 text-sm font-bold leading-5 text-stone-900 transition hover:text-emerald-800 sm:text-base sm:leading-6 md:text-lg"
              >
                {name}
              </Link>

              {(product.material || product.color) && (
                <p className="mt-1.5 line-clamp-1 text-xs text-stone-500 sm:text-sm">
                  {[product.material, product.color]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemove}
              disabled={updating}
              aria-label={`Remove ${name} from cart`}
              title="Remove item"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
            >
              <FiTrash2 size={17} />
            </button>
          </div>

          {/* Price */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-stone-900 sm:text-lg">
              {formatPrice(price)}
            </span>

            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through sm:text-sm">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Stock message */}
          {hasStockInformation && stock === 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
              <FiAlertCircle size={14} />
              Currently out of stock
            </p>
          )}

          {hasStockInformation && stock > 0 && stock <= 5 && (
            <p className="mt-2 text-xs font-medium text-amber-700">
              Only {stock} left in stock
            </p>
          )}

          {/* Quantity and subtotal */}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500 sm:text-xs">
                Quantity
              </p>

              <div className="inline-flex h-9 items-center rounded-full border border-stone-200 bg-stone-50 sm:h-10">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={!canDecrease}
                  aria-label={`Decrease quantity of ${name}`}
                  className="flex h-full w-9 items-center justify-center rounded-l-full text-stone-600 transition hover:bg-white hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-30 sm:w-10"
                >
                  <FiMinus size={14} />
                </button>

                <span
                  aria-live="polite"
                  className="min-w-8 px-1 text-center text-sm font-semibold tabular-nums text-stone-800"
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={!canIncrease}
                  aria-label={`Increase quantity of ${name}`}
                  className="flex h-full w-9 items-center justify-center rounded-r-full text-stone-600 transition hover:bg-white hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-30 sm:w-10"
                >
                  <FiPlus size={14} />
                </button>
              </div>

              {hasStockInformation && stock > 0 && quantity >= stock && (
                <p className="mt-1.5 text-[10px] text-stone-500">
                  Maximum available quantity
                </p>
              )}
            </div>

            <div className="min-w-0 text-right">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-stone-500 sm:text-xs">
                Subtotal
              </p>
              <p className="mt-1 wrap-break-words text-sm font-bold text-emerald-900 sm:text-base">
                {formatPrice(lineTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {updating && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/65 backdrop-blur-[1px] md:rounded-3xl">
          <span
            role="status"
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm"
          >
            Updating cart...
          </span>
        </div>
      )}
    </article>
  );
}

export default CartItem;
