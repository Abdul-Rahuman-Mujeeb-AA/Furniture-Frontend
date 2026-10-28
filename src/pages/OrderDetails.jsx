import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  CreditCard,
  Truck,
  XCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "");

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

const getOrderId = (order) =>
  order?._id || order?.id || order?.orderNumber || "";

const getOrderStatus = (order) =>
  String(
    order?.orderStatus || order?.status || order?.order_status || "placed",
  ).toLowerCase();

const getPaymentStatus = (order) =>
  String(order?.paymentStatus || "pending").toLowerCase();

const getOrderItems = (order) => {
  if (Array.isArray(order?.orderItems)) return order.orderItems;
  if (Array.isArray(order?.items)) return order.items;
  if (Array.isArray(order?.products)) return order.products;
  return [];
};

const getItemName = (item) =>
  item?.name || item?.product?.name || "Furniture item";

const getItemImage = (item) => {
  const image =
    item?.image ||
    item?.product?.images?.[0]?.url ||
    item?.product?.image ||
    "";

  return typeof image === "string" ? image : image?.url || "";
};

const getItemPrice = (item) =>
  Number(
    item?.price ?? item?.product?.discountPrice ?? item?.product?.price ?? 0,
  );

const getItemQuantity = (item) =>
  Math.max(1, Number(item?.quantity ?? item?.qty ?? 1));

const getOrderTotal = (order) => {
  const total = Number(
    order?.totalAmount ??
      order?.totalPrice ??
      order?.grandTotal ??
      order?.total ??
      0,
  );

  return Number.isFinite(total) && total >= 0 ? total : 0;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const statusStyles = {
  placed: "bg-orange-100 text-orange-800",
  pending: "bg-orange-100 text-orange-800",
  confirmed: "bg-sky-100 text-sky-800",
  processing: "bg-amber-100 text-amber-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStyles = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
};

const progressSteps = [
  { label: "Order placed", icon: Package },
  { label: "Confirmed", icon: Clock },
  { label: "Shipped", icon: Truck },
  { label: "Delivered", icon: CheckCircle2 },
];

const getProgressIndex = (status) => {
  switch (status) {
    case "placed":
    case "pending":
      return 0;
    case "confirmed":
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    default:
      return -1;
  }
};

const getShippingAddress = (order) => {
  const address =
    order?.shippingAddress || order?.deliveryAddress || order?.address;

  if (!address) return null;
  if (typeof address === "string") return { address };
  if (typeof address !== "object") return null;

  return address;
};

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(
    async (signal) => {
      const token = getToken();

      if (!token) {
        setError("Please log in to view your order.");
        setLoading(false);
        return;
      }

      if (!id) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${API_URL}/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
          timeout: 25000,
        });

        const payload = response.data;
        const orderData =
          payload?.order || payload?.data?.order || payload?.data || payload;

        if (
          !orderData ||
          typeof orderData !== "object" ||
          Array.isArray(orderData)
        ) {
          throw new Error("Order details were not found.");
        }

        setOrder(orderData);
      } catch (err) {
        if (err.code === "ERR_CANCELED" || axios.isCancel(err)) {
          return;
        }

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Unable to load order details.",
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [id],
  );

  useEffect(() => {
    const controller = new AbortController();

    // Run the request asynchronously after the effect begins.
    const timer = setTimeout(() => {
      void fetchOrder(controller.signal);
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchOrder]);

  const handleCancelOrder = async () => {
    if (!order || cancelling) return;

    const status = getOrderStatus(order);

    // Matches the cancellation rules in the backend controller.
    if (!["placed", "confirmed"].includes(status)) {
      toast.error("This order can no longer be cancelled.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      toast.error("Please log in to continue.");
      return;
    }

    setCancelling(true);

    try {
      const response = await axios.put(
        `${API_URL}/orders/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 25000,
        },
      );

      const updatedOrder = response.data?.order || response.data?.data?.order;

      if (updatedOrder) {
        setOrder((current) => ({
          ...current,
          ...updatedOrder,
        }));
      } else {
        setOrder((current) => ({
          ...current,
          orderStatus: "cancelled",
          status: "cancelled",
        }));
      }

      toast.success("Order cancelled successfully.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to cancel this order.",
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-stone-50 px-4">
        <div className="text-center">
          <RefreshCw className="mx-auto h-9 w-9 animate-spin text-emerald-800" />
          <p className="mt-4 text-sm text-stone-600">
            Loading order details...
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-stone-50 px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />

          <h1 className="mt-4 text-2xl font-semibold text-stone-900">
            Unable to open order
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            {error || "The requested order could not be found."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                void fetchOrder();
              }}
              className="rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Try again
            </button>

            <Link
              to="/my-orders"
              className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              My orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const orderId = getOrderId(order);
  const items = getOrderItems(order);
  const total = getOrderTotal(order);
  const orderStatus = getOrderStatus(order);
  const paymentStatus = getPaymentStatus(order);
  const progressIndex = getProgressIndex(orderStatus);
  const address = getShippingAddress(order);

  const subtotal = items.reduce(
    (sum, item) => sum + getItemPrice(item) * getItemQuantity(item),
    0,
  );

  const isCancelled = orderStatus === "cancelled";
  const canCancel = ["placed", "confirmed"].includes(orderStatus);

  return (
    <main className="min-h-screen bg-stone-50 pb-16">
      <section className="bg-[#173f35] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-2 text-sm text-emerald-100 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to my orders
          </Link>

          <div className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                Order information
              </p>

              <h1 className="mt-3 break-all text-3xl font-semibold tracking-tight sm:text-4xl">
                Order #{String(orderId).slice(-10)}
              </h1>

              <p className="mt-3 text-sm text-emerald-100">
                Placed on {formatDate(order.createdAt || order.orderDate)}
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                statusStyles[orderStatus] || "bg-white/15 text-white"
              }`}
            >
              {orderStatus}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Delivery / order progress */}
        <section className="mb-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                Order progress
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                This shows the delivery status, not the payment status.
              </p>
            </div>

            <Truck className="text-emerald-800" size={24} />
          </div>

          {isCancelled ? (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
              <XCircle className="mt-0.5 shrink-0" size={22} />
              <div>
                <p className="font-semibold">Order cancelled</p>
                <p className="mt-1 text-sm">
                  This order will not proceed to delivery.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {progressSteps.map((step, index) => {
                const Icon = step.icon;
                const completed = index <= progressIndex;

                return (
                  <div key={step.label} className="relative">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        completed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-100 text-stone-400"
                      }`}
                    >
                      <Icon size={22} />
                    </div>

                    <p
                      className={`mt-3 text-sm font-semibold ${
                        completed ? "text-stone-900" : "text-stone-400"
                      }`}
                    >
                      {step.label}
                    </p>

                    {index < progressSteps.length - 1 && (
                      <div
                        className={`absolute left-14 top-6 hidden h-0.5 w-[calc(100%-3rem)] sm:block ${
                          index < progressIndex
                            ? "bg-emerald-600"
                            : "bg-stone-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div className="space-y-8">
            {/* Ordered products */}
            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-stone-900">
                    Items ordered
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <Package className="text-emerald-800" size={23} />
              </div>

              {items.length === 0 ? (
                <p className="mt-6 rounded-2xl bg-stone-50 p-5 text-sm text-stone-600">
                  No product items were found for this order.
                </p>
              ) : (
                <div className="mt-6 divide-y divide-stone-100">
                  {items.map((item, index) => {
                    const image = getItemImage(item);
                    const quantity = getItemQuantity(item);
                    const price = getItemPrice(item);

                    return (
                      <div
                        key={item._id || item.id || index}
                        className="flex gap-4 py-5 first:pt-0 last:pb-0"
                      >
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-stone-100 sm:h-28 sm:w-28">
                          {image ? (
                            <img
                              src={image}
                              alt={getItemName(item)}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <Package className="text-stone-400" size={30} />
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div>
                            <h3 className="font-semibold text-stone-900">
                              {getItemName(item)}
                            </h3>
                            <p className="mt-1 text-sm text-stone-500">
                              Quantity: {quantity}
                            </p>
                            <p className="mt-1 text-sm text-stone-500">
                              {formatCurrency(price)} each
                            </p>
                          </div>

                          <p className="font-semibold text-stone-900 sm:text-right">
                            {formatCurrency(price * quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Delivery address */}
            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                  <MapPin size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    Delivery address
                  </h2>
                  <p className="text-sm text-stone-500">
                    Shipping information for this order
                  </p>
                </div>
              </div>

              {address ? (
                <div className="mt-5 space-y-1 text-sm leading-6 text-stone-600">
                  {address.fullName && (
                    <p className="font-semibold text-stone-900">
                      {address.fullName}
                    </p>
                  )}
                  {address.phone && <p>{address.phone}</p>}
                  {[
                    address.address,
                    address.apartment,
                    address.city,
                    address.state,
                    address.postalCode || address.zipCode,
                    address.country,
                  ]
                    .filter(Boolean)
                    .map((line, index) => (
                      <p key={`${line}-${index}`}>{line}</p>
                    ))}
                </div>
              ) : (
                <p className="mt-5 text-sm text-stone-500">
                  Delivery address information is unavailable.
                </p>
              )}
            </section>

            {/* Payment status is independent of delivery status */}
            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                  <CreditCard size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    Payment information
                  </h2>
                  <p className="text-sm text-stone-500">
                    Payment method and payment status
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-stone-50 p-4">
                <div>
                  <p className="text-sm font-medium capitalize text-stone-800">
                    {String(order.paymentMethod || "Not specified").replaceAll(
                      "_",
                      " ",
                    )}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">Payment status</p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      paymentStyles[paymentStatus] ||
                      "bg-stone-200 text-stone-700"
                    }`}
                  >
                    {paymentStatus}
                  </span>
                </div>

                <p className="text-lg font-semibold text-stone-900">
                  {formatCurrency(total)}
                </p>
              </div>

              {String(order.paymentMethod || "").toUpperCase() === "COD" &&
                paymentStatus === "pending" && (
                  <p className="mt-3 text-xs leading-5 text-stone-500">
                    Cash on Delivery selected. The payment status will remain
                    pending until your backend records the payment as received.
                  </p>
                )}
            </section>
          </div>

          {/* Order summary */}
          <aside className="space-y-6">
            <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-stone-900">
                Order summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4 text-stone-600">
                  <span>Items subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                <div className="border-t border-stone-200 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-stone-900">
                      Order total
                    </span>
                    <span className="text-xl font-bold text-emerald-900">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Order reference
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-stone-800">
                  {orderId || "Unavailable"}
                </p>
              </div>

              {canCancel && (
                <button
                  type="button"
                  onClick={() => void handleCancelOrder()}
                  disabled={cancelling}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelling ? (
                    <RefreshCw className="animate-spin" size={17} />
                  ) : (
                    <XCircle size={17} />
                  )}
                  {cancelling ? "Cancelling..." : "Cancel order"}
                </button>
              )}

              <Link
                to="/my-orders"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                View all orders
                <ArrowRight size={17} />
              </Link>
            </section>

            <section className="rounded-3xl bg-[#173f35] p-6 text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} />
                <h3 className="text-lg font-semibold">Need assistance?</h3>
              </div>

              <p className="mt-2 text-sm leading-6 text-emerald-100">
                If you have a question about your delivery or order status,
                contact the store administrator.
              </p>

              <Link
                to="/products"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white underline underline-offset-4 hover:text-emerald-200"
              >
                Continue shopping
                <ArrowRight size={16} />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default OrderDetails;
