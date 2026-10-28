
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiXCircle,
} from "react-icons/fi";

const API_URL =
  import.meta.env.VITE_API_URL;

const ORDER_STATUSES = [
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  "";

const getStatus = (order) =>
  String(order?.orderStatus || "placed").toLowerCase();

const getStatusLabel = (status) =>
  ORDER_STATUSES.find((item) => item.value === status)?.label ||
  String(status || "placed").replace(/_/g, " ");

const getStatusStyle = (status) => {
  const styles = {
    placed: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    shipped: "bg-violet-50 text-violet-700 border-violet-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
};

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getItems = (order) =>
  Array.isArray(order?.orderItems) ? order.orderItems : [];

function StatusIcon({ status, size = 16 }) {
  switch (status) {
    case "confirmed":
    case "delivered":
      return <FiCheckCircle size={size} />;

    case "shipped":
      return <FiTruck size={size} />;

    case "cancelled":
      return <FiXCircle size={size} />;

    default:
      return <FiClock size={size} />;
  }
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
        status
      )}`}
    >
      <StatusIcon status={status} size={14} />
      {getStatusLabel(status)}
    </span>
  );
}

function OrderProgress({ status }) {
  const steps = ["placed", "confirmed", "shipped", "delivered"];
  const currentIndex = steps.indexOf(status);

  if (status === "cancelled") {
    return (
      <div className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        <FiXCircle size={17} />
        This order has been cancelled.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-start justify-between gap-1">
        {steps.map((step, index) => {
          const completed = currentIndex >= index;

          return (
            <div
              key={step}
              className="flex min-w-0 flex-1 flex-col items-center"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                  completed
                    ? "border-[#294637] bg-[#294637] text-white"
                    : "border-[#e1e5dc] bg-white text-[#a1aaa0]"
                }`}
              >
                <StatusIcon status={step} size={14} />
              </div>

              <span
                className={`mt-2 text-center text-[10px] sm:text-xs ${
                  completed
                    ? "font-semibold text-[#294637]"
                    : "text-[#9aa39a]"
                }`}
              >
                {getStatusLabel(step)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e9ece5]">
        <div
          className="h-full rounded-full bg-[#789477] transition-all duration-500"
          style={{
            width:
              currentIndex < 0
                ? "0%"
                : `${(currentIndex / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please sign in to view your orders.");
      }

      const response = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      });

      const data = response?.data;

      const orderList = Array.isArray(data?.orders)
        ? data.orders
        : Array.isArray(data?.data?.orders)
          ? data.data.orders
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];

      setOrders(orderList);
      setErrorMessage("");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Unable to load your orders.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      if (active) {
        await fetchOrders();
      }
    };

    void loadOrders();

    return () => {
      active = false;
    };
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = getStatus(order);

      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }

      if (!query) return true;

      const searchable = [
        order?._id,
        order?.shippingAddress?.fullName,
        order?.shippingAddress?.city,
        ...getItems(order).map((item) => item?.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      placed: orders.filter((order) => getStatus(order) === "placed").length,
      shipped: orders.filter((order) => getStatus(order) === "shipped").length,
      delivered: orders.filter(
        (order) => getStatus(order) === "delivered"
      ).length,
    }),
    [orders]
  );

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 text-[#263c30] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-3xl bg-[#183d32] px-5 py-8 text-white sm:px-8 sm:py-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-[#d9e4d8]">
                <FiPackage size={14} />
                Your Furnispace account
              </span>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                My orders
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-[#d3dfd5]">
                Track your furniture purchases and check the latest delivery
                status of each order.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchOrders(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15 disabled:opacity-60 sm:self-auto"
            >
              <FiRefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh orders
            </button>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#e6e8e0] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-[#849086] sm:text-sm">Total orders</p>
              <FiShoppingBag size={17} className="text-[#648066]" />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e6e8e0] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-[#849086] sm:text-sm">Placed</p>
              <FiClock size={17} className="text-[#648066]" />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">
              {stats.placed}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e6e8e0] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-[#849086] sm:text-sm">Shipped</p>
              <FiTruck size={17} className="text-[#648066]" />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">
              {stats.shipped}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e6e8e0] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-[#849086] sm:text-sm">Delivered</p>
              <FiCheckCircle size={17} className="text-[#648066]" />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">
              {stats.delivered}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[#e6e8e0] bg-white p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <FiSearch
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#849086]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders or products..."
                className="w-full rounded-xl border border-[#e2e5dc] bg-[#fcfcfa] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#718c70] focus:ring-4 focus:ring-[#718c70]/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-[#e2e5dc] bg-[#fcfcfa] px-4 py-3 text-sm outline-none focus:border-[#718c70] sm:min-w-44"
              aria-label="Filter orders by status"
            >
              <option value="all">All statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading ? (
          <div className="mt-6 flex min-h-60 items-center justify-center rounded-3xl border border-[#e6e8e0] bg-white">
            <div className="flex flex-col items-center gap-3 text-[#849086]">
              <FiRefreshCw size={25} className="animate-spin" />
              <p className="text-sm">Loading your latest orders...</p>
            </div>
          </div>
        ) : errorMessage && orders.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-[#e6e8e0] bg-white px-5 py-14 text-center">
            <FiPackage size={30} className="mx-auto text-[#849086]" />
            <h2 className="mt-4 text-xl font-semibold">
              Could not load orders
            </h2>
            <p className="mt-2 text-sm text-[#849086]">{errorMessage}</p>
            <button
              type="button"
              onClick={() => void fetchOrders(true)}
              className="mt-5 rounded-xl bg-[#294637] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1e3528]"
            >
              Try again
            </button>
          </section>
        ) : filteredOrders.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-[#e6e8e0] bg-white px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf1e9] text-[#526e55]">
              <FiShoppingBag size={25} />
            </div>

            <h2 className="mt-4 text-xl font-semibold">
              {orders.length === 0 ? "No orders yet" : "No matching orders"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#849086]">
              {orders.length === 0
                ? "Your successfully placed orders will appear here."
                : "Try changing your search or status filter."}
            </p>

            {orders.length === 0 && (
              <Link
                to="/products"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#294637] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e3528]"
              >
                Explore products <FiArrowRight size={16} />
              </Link>
            )}
          </section>
        ) : (
          <section className="mt-6 space-y-5">
            {filteredOrders.map((order) => {
              const status = getStatus(order);
              const items = getItems(order);
              const orderId = order?._id || order?.id;

              return (
                <article
                  key={orderId}
                  className="overflow-hidden rounded-3xl border border-[#e6e8e0] bg-white shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-[#eff0eb] p-4 sm:flex-row sm:items-center sm:p-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#648066]">
                        Order #
                        {String(orderId || "").slice(-8).toUpperCase()}
                      </p>

                      <p className="mt-2 flex items-center gap-2 text-xs text-[#849086]">
                        <FiCalendar size={14} />
                        Ordered on {formatDate(order?.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                      <StatusBadge status={status} />
                      <p className="text-xl font-semibold tabular-nums">
                        {formatPrice(order?.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div
                          key={item?._id || item?.product?._id || index}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f2f2ed]">
                            {item?.image ? (
                              <img
                                src={item.image}
                                alt={item?.name || "Furniture"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <FiPackage
                                size={22}
                                className="text-[#849086]"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              {item?.name ||
                                item?.product?.name ||
                                "Furniture item"}
                            </p>
                            <p className="mt-1 text-xs text-[#849086]">
                              Qty: {item?.quantity || 1} ·{" "}
                              {formatPrice(item?.price)}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-semibold">
                            {formatPrice(
                              Number(item?.price || 0) *
                                Number(item?.quantity || 1)
                            )}
                          </p>
                        </div>
                      ))}
                    </div>

                    <OrderProgress status={status} />

                    <div className="mt-6 flex flex-col justify-between gap-4 border-t border-[#eff0eb] pt-5 sm:flex-row sm:items-center">
                      <div className="text-xs leading-5 text-[#849086]">
                        <p>
                          Payment:{" "}
                          <span className="font-medium text-[#526357]">
                            {order?.paymentMethod || "COD"}
                          </span>
                        </p>
                        <p className="mt-1">
                          Payment status:{" "}
                          <span className="font-medium capitalize text-[#526357]">
                            {order?.paymentStatus || "pending"}
                          </span>
                        </p>
                      </div>

                      <Link
                        to={`/orders/${orderId}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#294637] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e3528]"
                      >
                        View order details
                        <FiArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-[#e5e7df] py-5 text-sm sm:flex-row sm:items-center">
          <p className="text-xs text-[#849086]">
            Order status is retrieved from your Furnispace account.
          </p>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 font-semibold text-[#42654a] hover:text-[#294637]"
          >
            Continue shopping <FiArrowRight size={15} />
          </Link>
        </div>
      </div>
    </main>
  );
}

export default MyOrders;