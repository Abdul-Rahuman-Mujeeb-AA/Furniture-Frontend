
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  CreditCard,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const API_URL =
  import.meta.env.VITE_API_URL

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  "";

const getProduct = (item) => item?.product || item;

const getProductId = (item) => {
  const product = getProduct(item);
  return product?._id || product?.id || item?.productId;
};

const getQuantity = (item) =>
  Math.max(1, Number(item?.quantity || item?.qty || 1));

const getPrice = (item) => {
  const product = getProduct(item);
  const price =
    Number(product?.discountPrice) > 0 &&
    Number(product?.discountPrice) < Number(product?.price)
      ? Number(product.discountPrice)
      : Number(product?.price || 0);

  return Number.isFinite(price) ? price : 0;
};

const getImage = (item) => {
  const product = getProduct(item);
  const firstImage = product?.images?.[0];

  return (
    (typeof firstImage === "string" ? firstImage : firstImage?.url) ||
    product?.imageUrl ||
    product?.image ||
    ""
  );
};

const getCartItems = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.cart?.items)) return data.cart.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data?.cart?.items)) return data.data.cart.items;

  return [];
};

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function Cart() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [updatingId, setUpdatingId] = useState("");
  const [removingId, setRemovingId] = useState("");
  const [clearing, setClearing] = useState(false);

  const token = getToken();

  const requestConfig = useMemo(
    () => ({
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
      timeout: 20000,
    }),
    [token]
  );

  useEffect(() => {
    let active = true;

    const fetchCart = async () => {
      if (!token) {
        if (active) {
          setItems([]);
          setError("");
          setLoading(false);
        }
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/cart`, requestConfig);

        if (active) {
          setItems(getCartItems(response));
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.message ||
              (err?.code === "ERR_NETWORK"
                ? "Unable to connect to the store. Check your connection and try again."
                : "We couldn't load your cart. Please try again.")
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchCart();

    return () => {
      active = false;
    };
  }, [token, requestConfig, retryCount]);

  const totalQuantity = items.reduce(
    (sum, item) => sum + getQuantity(item),
    0
  );

  const subtotal = items.reduce(
    (sum, item) => sum + getPrice(item) * getQuantity(item),
    0
  );

  const shipping = subtotal === 0 || subtotal >= 5000 ? 0 : 199;
  const total = subtotal + shipping;
  const remainingForFreeShipping = Math.max(0, 5000 - subtotal);
  const shippingProgress = Math.min((subtotal / 5000) * 100, 100);

  const reloadCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart`, requestConfig);
      setItems(getCartItems(response));
      setError("");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to refresh your cart."
      );
    }
  };

  const updateQuantity = async (item, quantity) => {
    const productId = getProductId(item);

    if (!productId || quantity < 1) return;

    const product = getProduct(item);
    const stock = Number(product?.stock);

    if (
      Number.isFinite(stock) &&
      stock >= 0 &&
      quantity > stock
    ) {
      toast.error(`Only ${stock} item(s) are available.`);
      return;
    }

    setUpdatingId(String(productId));

    try {
      await axios.put(
        `${API_URL}/cart`,
        { productId, quantity },
        requestConfig
      );

      setItems((current) =>
        current.map((entry) =>
          String(getProductId(entry)) === String(productId)
            ? { ...entry, quantity }
            : entry
        )
      );

      toast.success("Cart updated.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to update quantity."
      );
      await reloadCart();
    } finally {
      setUpdatingId("");
    }
  };

  const removeItem = async (item) => {
    const productId = getProductId(item);

    if (!productId) {
      toast.error("Unable to identify this product.");
      return;
    }

    setRemovingId(String(productId));

    try {
      await axios.delete(`${API_URL}/cart/${productId}`, requestConfig);

      setItems((current) =>
        current.filter(
          (entry) => String(getProductId(entry)) !== String(productId)
        )
      );

      toast.success("Item removed.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to remove this item."
      );
      await reloadCart();
    } finally {
      setRemovingId("");
    }
  };

  const clearCart = async () => {
    if (!items.length || clearing) return;

    setClearing(true);

    try {
      await axios.delete(`${API_URL}/cart`, requestConfig);
      setItems([]);
      toast.success("Cart cleared.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to clear your cart."
      );
      await reloadCart();
    } finally {
      setClearing(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] text-[#263b30]">
        <Navbar />
        <main className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center px-4 py-16 sm:px-6">
          <section className="w-full rounded-4xl border border-[#e8e7df] bg-white px-6 py-12 text-center shadow-sm sm:px-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eaf0e9]">
              <ShoppingBag size={34} strokeWidth={1.5} />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#7b8c7d]">
              Your personal shopping space
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your cart is waiting.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#748078] sm:text-base">
              Sign in to access your cart and continue creating a space
              that feels like home.
            </p>
            <button
              onClick={() =>
                navigate("/login", {
                  state: { from: { pathname: "/cart" } },
                })
              }
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#294637] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e3528]"
            >
              Sign in to continue <ArrowRight size={17} />
            </button>
            <p className="mt-5 text-sm text-[#7b857d]">
              New to Furnispace?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#294637] underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#263b30]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
        <nav className="mb-8 flex items-center gap-2 text-xs font-medium text-[#8a938b] sm:text-sm">
          <Link to="/" className="transition hover:text-[#294637]">
            Home
          </Link>
          <ChevronRight size={15} />
          <span className="text-[#294637]">Shopping cart</span>
        </nav>

        <section className="relative mb-8 overflow-hidden rounded-[1.75rem] bg-[#263e32] px-6 py-8 text-white sm:px-10 sm:py-10 lg:mb-10 lg:px-12">
          <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/10 sm:h-80 sm:w-80" />
          <div className="pointer-events-none absolute -right-2 -top-14 h-48 w-48 rounded-full border border-white/10 sm:h-64 sm:w-64" />

          <div className="relative z-10 flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#dce7dc]">
                <Sparkles size={14} />
                Thoughtfully chosen for your home
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Your shopping cart
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#d0dcd1] sm:text-base">
                Review your selections and get one step closer to your
                perfect space.
              </p>
            </div>

            {!loading && !error && items.length > 0 && (
              <div className="flex items-center gap-3 self-start rounded-2xl border border-white/15 bg-white/10 px-4 py-3 sm:self-auto">
                <ShoppingBag size={20} />
                <div>
                  <p className="text-xl font-semibold leading-none">
                    {totalQuantity}
                  </p>
                  <p className="mt-1 text-xs text-[#d0dcd1]">
                    {totalQuantity === 1 ? "item selected" : "items selected"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader />
          </div>
        ) : error ? (
          <section className="rounded-3xl border border-[#e7e5dd] bg-white p-6 sm:p-10">
            <ErrorMessage
              message={error}
              onRetry={() => setRetryCount((count) => count + 1)}
            />
          </section>
        ) : items.length === 0 ? (
          <section className="rounded-[1.75rem] border border-[#e8e7df] bg-white px-5 py-14 text-center sm:px-10 sm:py-20">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#edf1e9] text-[#294637]">
              <ShoppingBag size={42} strokeWidth={1.3} />
            </div>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-[#8a978b]">
              A little room for something beautiful
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Your cart is taking a breather.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#7b857d] sm:text-base">
              Explore timeless furniture, natural textures, and thoughtful
              details to find pieces that make your home feel more like you.
            </p>
            <Link
              to="/products"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#294637] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e3528]"
            >
              Explore the collection <ArrowRight size={17} />
            </Link>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-[#849087] sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} /> Secure checkout
              </span>
              <span className="inline-flex items-center gap-2">
                <PackageCheck size={16} /> Carefully selected pieces
              </span>
            </div>
          </section>
        ) : (
          <>
            <section className="mb-6 rounded-2xl border border-[#e6e8de] bg-[#eff2e9] px-4 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#294637]">
                  <Truck size={19} />
                </div>
                <div className="flex-1">
                  {remainingForFreeShipping > 0 ? (
                    <>
                      <p className="text-sm font-semibold">
                        You're {formatPrice(remainingForFreeShipping)} away
                        from free shipping
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#748078] sm:text-sm">
                        Orders of ₹5,000 or more qualify for complimentary
                        shipping.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold">
                      You've unlocked free shipping on this order.
                    </p>
                  )}
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#dce2d5]">
                    <div
                      className="h-full rounded-full bg-[#526d51] transition-all duration-500"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
              <section className="min-w-0 overflow-hidden rounded-3xl border border-[#e8e7df] bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeede7] px-5 py-5 sm:px-7">
                  <div>
                    <h2 className="text-lg font-semibold sm:text-xl">
                      Your selections
                    </h2>
                    <p className="mt-1 text-xs text-[#879087] sm:text-sm">
                      Review each piece before checking out.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearCart}
                    disabled={clearing}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-[#8c655d] transition hover:bg-[#faf0ed] disabled:opacity-50 sm:text-sm"
                  >
                    <Trash2 size={15} />
                    {clearing ? "Clearing..." : "Clear cart"}
                  </button>
                </div>

                <div className="divide-y divide-[#eeede7] px-4 sm:px-7">
                  {items.map((item, index) => {
                    const product = getProduct(item);
                    const productId = getProductId(item);
                    const quantity = getQuantity(item);
                    const price = getPrice(item);
                    const originalPrice = Number(product?.price || price);
                    const image = getImage(item);
                    const isUpdating = updatingId === String(productId);
                    const isRemoving = removingId === String(productId);
                    const stock = Number(product?.stock);

                    return (
                      <article
                        key={productId || item?._id || index}
                        className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:gap-5 sm:py-6"
                      >
                        <Link
                          to={productId ? `/products/${productId}` : "/products"}
                          className="group relative block aspect-5/4 w-full shrink-0 overflow-hidden rounded-2xl bg-[#f1f0eb] sm:aspect-square sm:w-28 md:w-32"
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={product?.name || "Furniture product"}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#8b9488]">
                              <ShoppingBag size={32} strokeWidth={1.2} />
                            </div>
                          )}
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:min-h-28">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                to={productId ? `/products/${productId}` : "/products"}
                                className="line-clamp-2 text-base font-semibold leading-6 transition hover:text-[#6d806b] sm:text-lg"
                              >
                                {product?.name || "Furniture item"}
                              </Link>
                              <p className="mt-1.5 text-xs text-[#8a938b] sm:text-sm">
                                {product?.category?.name ||
                                  (typeof product?.category === "string"
                                    ? product.category
                                    : "Furniture collection")}
                                {product?.material ? ` · ${product.material}` : ""}
                              </p>
                              {Number.isFinite(stock) && stock > 0 && stock <= 5 && (
                                <p className="mt-2 text-xs font-medium text-[#9b6b3e]">
                                  Only {stock} left in stock
                                </p>
                              )}
                              {stock === 0 && (
                                <p className="mt-2 text-xs font-medium text-red-600">
                                  Currently out of stock
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item)}
                              disabled={isRemoving || clearing}
                              aria-label={`Remove ${product?.name || "item"}`}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#9a9f97] transition hover:bg-[#faf0ed] hover:text-[#a35d50] disabled:opacity-50"
                            >
                              {isRemoving ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#b7b9b1] border-t-transparent" />
                              ) : (
                                <X size={18} />
                              )}
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="inline-flex items-center rounded-full border border-[#e6e5de] bg-[#fbfaf7] p-1">
                              <button
                                type="button"
                                onClick={() =>
                                  quantity === 1
                                    ? removeItem(item)
                                    : updateQuantity(item, quantity - 1)
                                }
                                disabled={isUpdating || isRemoving || clearing}
                                aria-label="Decrease quantity"
                                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white disabled:opacity-40"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="min-w-9 px-2 text-center text-sm font-semibold tabular-nums">
                                {isUpdating ? "…" : quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item, quantity + 1)}
                                disabled={
                                  isUpdating ||
                                  isRemoving ||
                                  clearing ||
                                  (Number.isFinite(stock) && quantity >= stock)
                                }
                                aria-label="Increase quantity"
                                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white disabled:opacity-40"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-base font-semibold tabular-nums sm:text-lg">
                                {formatPrice(price * quantity)}
                              </p>
                              {originalPrice > price && (
                                <p className="mt-0.5 text-xs text-[#9a9e96] line-through">
                                  {formatPrice(originalPrice * quantity)}
                                </p>
                              )}
                              {quantity > 1 && (
                                <p className="mt-0.5 text-xs text-[#8a938b]">
                                  {formatPrice(price)} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="border-t border-[#eeede7] px-5 py-5 sm:px-7">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#45634c] transition hover:text-[#203a2a]"
                  >
                    <ArrowLeft size={17} />
                    Continue shopping
                  </Link>
                </div>
              </section>

              <aside className="space-y-5 lg:sticky lg:top-24">
                <section className="rounded-3xl border border-[#e8e7df] bg-white p-5 sm:p-7">
                  <h2 className="text-xl font-semibold">Order summary</h2>
                  <p className="mt-1 text-sm text-[#879087]">
                    Your order, at a glance.
                  </p>

                  <div className="mt-7 space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#7b857d]">
                        Subtotal ({totalQuantity}{" "}
                        {totalQuantity === 1 ? "item" : "items"})
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-[#7b857d]">
                        <Truck size={16} /> Shipping
                      </span>
                      <span className={shipping === 0 ? "font-semibold text-[#426c4b]" : "font-medium"}>
                        {shipping === 0 ? "Free" : formatPrice(shipping)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-[#7b857d]">
                        <Tag size={16} /> Discount
                      </span>
                      <span className="font-medium tabular-nums text-[#426c4b]">
                        {formatPrice(
                          items.reduce(
                            (sum, item) =>
                              sum +
                              Math.max(
                                0,
                                Number(getProduct(item)?.price || 0) - getPrice(item)
                              ) *
                                getQuantity(item),
                            0
                          )
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="my-6 border-t border-dashed border-[#dedfd6]" />

                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold">Total</p>
                      <p className="mt-1 text-xs text-[#8a938b]">
                        Inclusive of applicable taxes
                      </p>
                    </div>
                    <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                      {formatPrice(total)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/checkout")}
                    disabled={items.some(
                      (item) => Number(getProduct(item)?.stock) === 0
                    )}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#294637] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#1e3528] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue to checkout <ArrowRight size={17} />
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#899188]">
                    <ShieldCheck size={15} />
                    Secure checkout experience
                  </div>

                  <div className="mt-6 rounded-2xl bg-[#f7f6f2] p-4">
                    <div className="flex items-start gap-3">
                      <CreditCard size={19} className="mt-0.5 shrink-0 text-[#536b54]" />
                      <div>
                        <p className="text-sm font-semibold">A smoother checkout</p>
                        <p className="mt-1 text-xs leading-5 text-[#7f897f]">
                          Confirm your delivery address and review your order
                          before placing it.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-[#e8e7df] bg-[#eeefe7] p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#45634c]">
                      <PackageCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">
                        Designed for everyday living
                      </h3>
                      <p className="mt-1.5 text-xs leading-6 text-[#758075]">
                        Thoughtful furniture and practical details to help
                        make your space feel complete.
                      </p>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Cart;