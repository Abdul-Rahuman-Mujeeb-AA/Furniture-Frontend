import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  LockKeyhole,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const API_URL =
  import.meta.env.VITE_API_URL;

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

const getProduct = (item) => item?.product || item;

const getProductId = (item) => {
  const product = getProduct(item);
  return product?._id || product?.id || item?.productId || "";
};

const getQuantity = (item) =>
  Math.max(1, Number(item?.quantity || item?.qty || 1));

const getPrice = (item) => {
  const product = getProduct(item);

  const price =
    product?.discountPrice != null
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
  if (Array.isArray(data?.data?.cart?.items)) {
    return data.data.cart.items;
  }

  return [];
};

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const initialAddress = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

function Checkout() {
  const navigate = useNavigate();
  const token = getToken();

  const [items, setItems] = useState([]);
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const requestConfig = useMemo(
    () => ({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 20000,
    }),
    [token],
  );

  useEffect(() => {
    let active = true;

    const fetchCheckoutData = async () => {
      if (!token) {
        if (active) {
          setError("Please sign in to continue to checkout.");
          setLoading(false);
        }
        return;
      }

      try {
        const [cartResult, profileResult] = await Promise.allSettled([
          axios.get(`${API_URL}/cart`, requestConfig),
          axios.get(`${API_URL}/auth/profile`, requestConfig),
        ]);

        if (!active) return;

        if (cartResult.status === "fulfilled") {
          setItems(getCartItems(cartResult.value));
        } else {
          setError(
            cartResult.reason?.response?.data?.message ||
              "Unable to load your cart. Please try again.",
          );
        }

        if (profileResult.status === "fulfilled") {
          const profileData = profileResult.value?.data;
          const user =
            profileData?.user ||
            profileData?.data?.user ||
            profileData?.data ||
            profileData;

          setAddress((current) => ({
            ...current,
            fullName: user?.name || user?.fullName || current.fullName,
            email: user?.email || current.email,
            phone: user?.phone || current.phone,
            address: user?.address || current.address,
            city: user?.city || current.city,
            state: user?.state || current.state,
            postalCode: user?.postalCode || current.postalCode,
            country: user?.country || current.country || "India",
          }));
        }
      } catch {
        if (active) {
          setError("Something went wrong while preparing your checkout.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchCheckoutData();

    return () => {
      active = false;
    };
  }, [token, requestConfig]);

  const subtotal = items.reduce(
    (sum, item) => sum + getPrice(item) * getQuantity(item),
    0,
  );

  const totalQuantity = items.reduce((sum, item) => sum + getQuantity(item), 0);

  const discount = items.reduce((sum, item) => {
    const product = getProduct(item);
    const originalPrice = Number(product?.price || 0);
    const currentPrice = getPrice(item);

    return sum + Math.max(0, originalPrice - currentPrice) * getQuantity(item);
  }, 0);

  // The current backend calculates totalAmount from cart products only.
  const total = subtotal;

  const updateAddress = (event) => {
    const { name, value } = event.target;

    setAddress((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!address.fullName.trim()) {
      errors.fullName = "Enter your full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!/^[6-9]\d{9}$/.test(address.phone.replace(/\D/g, ""))) {
      errors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!address.address.trim()) {
      errors.address = "Enter your delivery address.";
    }

    if (!address.city.trim()) {
      errors.city = "Enter your city.";
    }

    if (!address.state.trim()) {
      errors.state = "Enter your state.";
    }

    if (!/^\d{6}$/.test(address.postalCode.trim())) {
      errors.postalCode = "Enter a valid 6-digit PIN code.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please correct the highlighted fields.");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!token) {
      navigate("/login", {
        state: { from: { pathname: "/checkout" } },
      });
      return;
    }

    if (!items.length) {
      toast.error("Your cart is empty.");
      navigate("/products");
      return;
    }

    const invalidItem = items.find((item) => {
      const product = getProduct(item);
      return (
        !getProductId(item) || Number(product?.stock ?? 0) < getQuantity(item)
      );
    });

    if (invalidItem) {
      toast.error(
        "A product is unavailable or has insufficient stock. Please check your cart.",
      );
      return;
    }

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // These field names match backend/controllers/orderController.js.
      // Do not nest them inside shippingAddress.
      const orderPayload = {
        fullName: address.fullName.trim(),
        phone: address.phone.replace(/\D/g, ""),
        address: address.address.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        postalCode: address.postalCode.trim(),
        country: address.country || "India",
      };

      const response = await axios.post(
        `${API_URL}/orders`,
        orderPayload,
        requestConfig,
      );

      const data = response?.data;
      const order = data?.order || data?.data?.order || data?.data || data;
      const orderId = order?._id || order?.id || order?.orderId;

      toast.success(
        data?.message || "Your order has been placed successfully.",
      );

      if (orderId) {
        navigate(`/orders/${orderId}`, { replace: true });
      } else {
        navigate("/my-orders", { replace: true });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "We couldn't place your order. Please check your details and try again.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (name) =>
    `mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#293d31] outline-none transition placeholder:text-[#a0a79e] focus:border-[#526e55] focus:ring-4 focus:ring-[#526e55]/10 ${
      fieldErrors[name] ? "border-red-400" : "border-[#e5e6df]"
    }`;

  const renderField = ({
    name,
    label,
    placeholder,
    type = "text",
    required = true,
    autoComplete,
  }) => (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-[#394b3e]">
        {label}
        {required && <span className="ml-1 text-[#9b6b56]">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={address[name]}
        onChange={updateAddress}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(fieldErrors[name])}
        className={inputClass(name)}
      />

      {fieldErrors[name] && (
        <p className="mt-1.5 text-xs text-red-600">{fieldErrors[name]}</p>
      )}
    </div>
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] text-[#293d31]">
        <Navbar />

        <main className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4 py-16">
          <section className="w-full rounded-3xl border border-[#e8e7df] bg-white p-8 text-center sm:p-12">
            <LockKeyhole
              size={42}
              className="mx-auto text-[#49644d]"
              strokeWidth={1.5}
            />

            <h1 className="mt-5 text-2xl font-semibold">
              Sign in to check out
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#7d887e]">
              Sign in to confirm your delivery details and complete your
              furniture order.
            </p>

            <Link
              to="/login"
              state={{ from: { pathname: "/checkout" } }}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#294637] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1e3528]"
            >
              Sign in <ArrowRight size={16} />
            </Link>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#293d31]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-6 sm:pt-10 lg:px-8">
        <nav className="mb-7 flex items-center gap-2 text-xs text-[#879087] sm:text-sm">
          <Link to="/" className="hover:text-[#294637]">
            Home
          </Link>
          <ChevronRight size={15} />
          <Link to="/cart" className="hover:text-[#294637]">
            Cart
          </Link>
          <ChevronRight size={15} />
          <span className="font-medium text-[#294637]">Checkout</span>
        </nav>

        <section className="relative mb-8 overflow-hidden rounded-[1.75rem] bg-[#263e32] px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-12">
          <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/10 sm:h-80 sm:w-80" />

          <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-[#dce7dc]">
                <ShieldCheck size={14} />
                Secure checkout
              </span>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Make it yours.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#d0dcd1] sm:text-base">
                Add your delivery details and confirm your furniture order.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#dce7dc] sm:text-sm">
              <CheckCircle2 size={17} />
              Cash on delivery
            </div>
          </div>

          <div className="relative z-10 mt-8 grid grid-cols-3 gap-2 border-t border-white/15 pt-5 sm:max-w-lg sm:gap-4">
            {[
              { number: "01", label: "Delivery", active: true },
              { number: "02", label: "Payment", active: false },
              { number: "03", label: "Confirmation", active: false },
            ].map((step) => (
              <div
                key={step.number}
                className="flex items-center gap-2 sm:gap-3"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    step.active
                      ? "bg-white text-[#294637]"
                      : "border border-white/20 text-white/70"
                  }`}
                >
                  {step.number}
                </span>
                <span className="text-xs font-medium sm:text-sm">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <Loader />
          </div>
        ) : error ? (
          <section className="rounded-3xl border border-[#e8e7df] bg-white p-6 sm:p-10">
            <ErrorMessage message={error} />
            <Link
              to="/cart"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#294637]"
            >
              <ArrowLeft size={16} />
              Return to cart
            </Link>
          </section>
        ) : items.length === 0 ? (
          <section className="rounded-3xl border border-[#e8e7df] bg-white px-5 py-14 text-center sm:px-10 sm:py-20">
            <ShoppingBag
              size={42}
              strokeWidth={1.4}
              className="mx-auto text-[#526e55]"
            />

            <h2 className="mt-5 text-2xl font-semibold">Your cart is empty</h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7d887e]">
              Add furniture to your cart before continuing to checkout.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#294637] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1e3528]"
            >
              Explore furniture <ArrowRight size={16} />
            </Link>
          </section>
        ) : (
          <form onSubmit={handlePlaceOrder} noValidate>
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
              <div className="space-y-6">
                <section className="rounded-3xl border border-[#e8e7df] bg-white p-5 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf1e9] text-[#45634c]">
                      <MapPin size={21} />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold sm:text-xl">
                        Delivery details
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-[#879087]">
                        Where should we deliver your furniture?
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {renderField({
                      name: "fullName",
                      label: "Full name",
                      placeholder: "Enter your full name",
                      autoComplete: "name",
                    })}

                    {renderField({
                      name: "email",
                      label: "Email address",
                      placeholder: "you@example.com",
                      type: "email",
                      autoComplete: "email",
                    })}

                    {renderField({
                      name: "phone",
                      label: "Mobile number",
                      placeholder: "10-digit mobile number",
                      type: "tel",
                      autoComplete: "tel",
                    })}

                    <div>
                      <label
                        htmlFor="country"
                        className="text-sm font-medium text-[#394b3e]"
                      >
                        Country
                      </label>
                      <input
                        id="country"
                        value={address.country}
                        readOnly
                        className={`${inputClass("country")} bg-[#f7f6f2]`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      {renderField({
                        name: "address",
                        label: "Street address",
                        placeholder: "House number and street name",
                        autoComplete: "street-address",
                      })}
                    </div>

                    <div className="sm:col-span-2">
                      {renderField({
                        name: "apartment",
                        label: "Apartment, suite, landmark",
                        placeholder: "Apartment, floor, landmark (optional)",
                        required: false,
                        autoComplete: "address-line2",
                      })}
                    </div>

                    {renderField({
                      name: "city",
                      label: "City",
                      placeholder: "Your city",
                      autoComplete: "address-level2",
                    })}

                    {renderField({
                      name: "state",
                      label: "State",
                      placeholder: "Your state",
                      autoComplete: "address-level1",
                    })}

                    {renderField({
                      name: "postalCode",
                      label: "PIN code",
                      placeholder: "6-digit PIN code",
                      autoComplete: "postal-code",
                    })}
                  </div>

                  <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#f7f6f2] p-4">
                    <Truck
                      size={19}
                      className="mt-0.5 shrink-0 text-[#536b54]"
                    />
                    <p className="text-xs leading-6 text-[#788378] sm:text-sm">
                      Check your address and phone number before placing the
                      order.
                    </p>
                  </div>
                </section>

                <section className="rounded-3xl border border-[#e8e7df] bg-white p-5 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf1e9] text-[#45634c]">
                      <CreditCard size={21} />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold sm:text-xl">
                        Payment method
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-[#879087]">
                        Pay when your furniture arrives.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-[#58765b] bg-[#f2f5ef] p-4 ring-1 ring-[#58765b]/20">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#45634c]">
                        <Wallet size={20} />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          Cash on delivery
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#879087]">
                          Pay when your order is delivered.
                        </p>
                      </div>

                      <CheckCircle2
                        size={19}
                        className="shrink-0 text-[#45634c]"
                      />
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-[#879087]">
                    Your current backend supports COD orders. Online payment
                    requires a payment gateway and server-side verification.
                  </p>
                </section>
              </div>

              <aside className="space-y-5 lg:sticky lg:top-24">
                <section className="rounded-3xl border border-[#e8e7df] bg-white p-5 sm:p-7">
                  <h2 className="text-xl font-semibold">Order summary</h2>
                  <p className="mt-1 text-sm text-[#879087]">
                    {totalQuantity} {totalQuantity === 1 ? "item" : "items"} in
                    your order
                  </p>

                  <div className="mt-6 max-h-72 space-y-4 overflow-y-auto pr-1">
                    {items.map((item, index) => {
                      const product = getProduct(item);
                      const productId = getProductId(item);

                      return (
                        <div
                          key={productId || item?._id || index}
                          className="flex items-center gap-3"
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f1f0eb]">
                            {getImage(item) ? (
                              <img
                                src={getImage(item)}
                                alt={product?.name || "Furniture"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[#8b9488]">
                                <Package size={23} />
                              </div>
                            )}

                            <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#294637] px-1 text-[10px] font-semibold text-white">
                              {getQuantity(item)}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-medium">
                              {product?.name || "Furniture item"}
                            </p>
                            <p className="mt-1 text-xs text-[#879087]">
                              {formatPrice(getPrice(item))} each
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-semibold tabular-nums">
                            {formatPrice(getPrice(item) * getQuantity(item))}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="my-6 border-t border-dashed border-[#dedfd6]" />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-[#7b857d]">Subtotal</span>
                      <span className="font-medium tabular-nums">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-[#7b857d]">Shipping</span>
                      <span className="font-medium">Free</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-[#7b857d]">Product savings</span>
                      <span className="font-medium text-[#426c4b]">
                        −{formatPrice(discount)}
                      </span>
                    </div>
                  </div>

                  <div className="my-5 border-t border-[#e8e7df]" />

                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="font-semibold">Total to pay</p>
                      <p className="mt-1 text-xs text-[#879087]">
                        Cash on delivery
                      </p>
                    </div>
                    <p className="text-2xl font-semibold tracking-tight tabular-nums">
                      {formatPrice(total)}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      !items.length ||
                      items.some((item) => {
                        const product = getProduct(item);
                        return (
                          !getProductId(item) ||
                          Number(product?.stock ?? 0) < getQuantity(item)
                        );
                      })
                    }
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#294637] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#1e3528] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Placing order...
                      </>
                    ) : (
                      <>
                        Place order <ArrowRight size={17} />
                      </>
                    )}
                  </button>

                  <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#879087]">
                    <LockKeyhole size={14} />
                    Your information is sent securely
                  </p>

                  <Link
                    to="/cart"
                    className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-[#536b54] hover:text-[#294637]"
                  >
                    <ArrowLeft size={16} />
                    Back to cart
                  </Link>
                </section>

                <section className="rounded-3xl border border-[#e8e7df] bg-[#eeefe7] p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <Package
                      size={20}
                      className="mt-0.5 shrink-0 text-[#536b54]"
                    />
                    <div>
                      <h3 className="text-sm font-semibold">
                        Thoughtful pieces, delivered
                      </h3>
                      <p className="mt-1.5 text-xs leading-6 text-[#758075]">
                        Review your address carefully. Delivery timing may
                        depend on your location.
                      </p>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;