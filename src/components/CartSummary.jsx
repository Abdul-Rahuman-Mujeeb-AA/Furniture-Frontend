import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiShoppingBag,
  FiArrowRight,
  FiTag,
  FiTruck,
  FiShield,
  FiCheckCircle,
  FiLock,
} from "react-icons/fi";

function CartSummary({
  items = [],
  onCheckout,
  checkoutPath = "/checkout",
  loading = false,
  shippingFee = 0,
  freeShippingThreshold = 5000,
  taxRate = 0,
  couponDiscount = 0,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const summary = useMemo(() => {
    const subtotal = items.reduce((total, item) => {
      const product =
        item?.product && typeof item.product === "object"
          ? item.product
          : item;

      const price = Number(
        product?.discountPrice ?? product?.price ?? 0
      );
      const quantity = Math.max(0, Number(item?.quantity) || 0);

      return total + price * quantity;
    }, 0);

    const originalTotal = items.reduce((total, item) => {
      const product =
        item?.product && typeof item.product === "object"
          ? item.product
          : item;

      const originalPrice = Number(product?.price ?? 0);
      const salePrice = Number(
        product?.discountPrice ?? product?.price ?? 0
      );
      const quantity = Math.max(0, Number(item?.quantity) || 0);

      return (
        total +
        Math.max(0, originalPrice - salePrice) * quantity
      );
    }, 0);

    const discount = Math.max(0, originalTotal);
    const coupon = Math.min(
      subtotal,
      Math.max(0, Number(couponDiscount) || 0)
    );

    const taxableAmount = Math.max(0, subtotal - coupon);
    const shipping =
      taxableAmount === 0 ||
      (freeShippingThreshold > 0 &&
        taxableAmount >= freeShippingThreshold)
        ? 0
        : Math.max(0, Number(shippingFee) || 0);

    const tax = taxableAmount * Math.max(0, Number(taxRate) || 0);
    const total = taxableAmount + shipping + tax;

    return {
      subtotal,
      originalTotal,
      discount,
      coupon,
      shipping,
      tax,
      total,
      quantity: items.reduce(
        (count, item) => count + Math.max(0, Number(item?.quantity) || 0),
        0
      ),
    };
  }, [
    items,
    shippingFee,
    freeShippingThreshold,
    taxRate,
    couponDiscount,
  ]);

  const isEmpty = items.length === 0 || summary.quantity === 0;

  const remainingForFreeShipping =
    freeShippingThreshold > 0
      ? Math.max(
          0,
          freeShippingThreshold -
            Math.max(0, summary.subtotal - summary.coupon)
        )
      : 0;

  const shippingProgress =
    freeShippingThreshold > 0
      ? Math.min(
          100,
          ((freeShippingThreshold - remainingForFreeShipping) /
            freeShippingThreshold) *
            100
        )
      : 100;

  const handleCheckout = () => {
    if (loading || isEmpty) return;
    onCheckout?.();
  };

  return (
    <aside className="w-full min-w-0">
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm sm:rounded-3xl">
        {/* Heading */}
        <div className="relative overflow-hidden bg-emerald-950 px-5 py-6 text-white sm:px-6 sm:py-7">
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-1 -top-3 h-24 w-24 rounded-full border border-white/10" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <FiShoppingBag size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-tight sm:text-xl">
                Order summary
              </h2>
              <p className="mt-1 text-xs text-emerald-100/75 sm:text-sm">
                {summary.quantity}{" "}
                {summary.quantity === 1 ? "item" : "items"} in your bag
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {/* Free shipping progress */}
          {!isEmpty && freeShippingThreshold > 0 && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm">
                  {remainingForFreeShipping === 0 ? (
                    <FiCheckCircle size={18} />
                  ) : (
                    <FiTruck size={18} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-emerald-950">
                    {remainingForFreeShipping === 0
                      ? "You've unlocked free shipping!"
                      : `Add ${formatPrice(remainingForFreeShipping)} more`}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-800/75">
                    {remainingForFreeShipping === 0
                      ? "Your order qualifies for free shipping."
                      : `Spend ${formatPrice(freeShippingThreshold)} to qualify for free shipping.`}
                  </p>

                  <div
                    className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-100"
                    role="progressbar"
                    aria-label="Free shipping progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(shippingProgress)}
                  >
                    <div
                      className="h-full rounded-full bg-emerald-700 transition-all duration-500"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Price breakdown */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-stone-900">
              Price details
            </h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-stone-500">
                  Subtotal ({summary.quantity}{" "}
                  {summary.quantity === 1 ? "item" : "items"})
                </span>
                <span className="shrink-0 font-medium tabular-nums text-stone-800">
                  {formatPrice(summary.subtotal + summary.originalTotal)}
                </span>
              </div>

              {summary.discount > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <FiTag size={14} />
                    Product savings
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-emerald-700">
                    −{formatPrice(summary.discount)}
                  </span>
                </div>
              )}

              {summary.coupon > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-emerald-700">
                    Coupon discount
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-emerald-700">
                    −{formatPrice(summary.coupon)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-stone-500">
                  <FiTruck size={15} />
                  Shipping
                </span>
                {summary.shipping === 0 ? (
                  <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    Free
                  </span>
                ) : (
                  <span className="shrink-0 font-medium tabular-nums text-stone-800">
                    {formatPrice(summary.shipping)}
                  </span>
                )}
              </div>

              {taxRate > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-stone-500">
                    Estimated tax
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-stone-800">
                    {formatPrice(summary.tax)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-dashed border-stone-200" />

          {/* Total */}
          <div className="rounded-2xl bg-[#faf9f6] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-stone-900">
                  Estimated total
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {taxRate > 0
                    ? "Including estimated tax"
                    : "Shipping included where applicable"}
                </p>
              </div>

              <p className="text-xl font-bold tracking-tight text-emerald-950 sm:text-2xl">
                {formatPrice(summary.total)}
              </p>
            </div>

            {summary.discount + summary.coupon > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <FiCheckCircle size={14} />
                You're saving{" "}
                {formatPrice(summary.discount + summary.coupon)}
              </p>
            )}
          </div>

          {/* Checkout */}
          {onCheckout ? (
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isEmpty || loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none"
            >
              {loading ? "Preparing checkout..." : "Proceed to checkout"}
              {!loading && (
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              )}
            </button>
          ) : (
            <Link
              to={checkoutPath}
              aria-disabled={isEmpty}
              onClick={(event) => {
                if (isEmpty) event.preventDefault();
              }}
              className={`group flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-bold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-emerald-700/20 ${
                isEmpty
                  ? "pointer-events-none bg-stone-300 text-stone-500"
                  : "bg-emerald-800 text-white hover:bg-emerald-900 hover:shadow-md"
              }`}
            >
              Proceed to checkout
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}

          {/* Security notes */}
          <div className="flex items-center justify-center gap-2 text-center text-xs text-stone-500">
            <FiLock className="shrink-0 text-emerald-700" />
            <span>Secure checkout · Your details stay protected</span>
          </div>

          <div className="flex items-start gap-2 border-t border-stone-100 pt-4">
            <FiShield
              size={17}
              className="mt-0.5 shrink-0 text-emerald-700"
            />
            <p className="text-xs leading-5 text-stone-500">
              Final shipping, taxes, and availability are confirmed at
              checkout. Prices may change if your cart is updated.
            </p>
          </div>

          {/* Optional details toggle */}
          <button
            type="button"
            onClick={() => setShowDetails((previous) => !previous)}
            className="w-full text-center text-xs font-semibold text-stone-500 transition hover:text-emerald-800"
            aria-expanded={showDetails}
          >
            {showDetails ? "Hide calculation details" : "How is the total calculated?"}
          </button>

          {showDetails && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs leading-5 text-stone-600">
              The total uses each item's selling price multiplied by its
              quantity, minus any supplied coupon discount, plus shipping
              and estimated tax. Your backend should recalculate and
              validate the final amount before creating an order.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default CartSummary;
