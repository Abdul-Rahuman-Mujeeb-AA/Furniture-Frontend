import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiEye,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiXCircle,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "");

const ORDER_STATUSES = [
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  "Something went wrong. Please try again.";

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
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getOrderId = (order) => order?._id || order?.id || "";

const getOrderNumber = (order) => {
  const id = getOrderId(order);
  return id ? id.slice(-8).toUpperCase() : "UNKNOWN";
};

const getStatus = (order) =>
  String(order?.orderStatus || "placed").toLowerCase();

const getPaymentStatus = (order) =>
  String(order?.paymentStatus || "pending").toLowerCase();

const getStatusLabel = (status) =>
  ORDER_STATUSES.find((item) => item.value === status)?.label ||
  status?.replace(/_/g, " ") ||
  "Placed";

const getPaymentStatusLabel = (status) =>
  PAYMENT_STATUSES.find((item) => item.value === status)?.label ||
  status ||
  "Pending";

const getCustomerName = (order) =>
  order?.user?.name || order?.shippingAddress?.fullName || "Customer";

const getCustomerEmail = (order) => order?.user?.email || "";

const getOrderItems = (order) =>
  Array.isArray(order?.orderItems) ? order.orderItems : [];

const getItemCount = (order) =>
  getOrderItems(order).reduce(
    (total, item) => total + Number(item?.quantity || 1),
    0,
  );

const getOrderTotal = (order) => Number(order?.totalAmount || 0);

const getOrderList = (response) => {
  const data = response?.data;

  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data?.orders)) return data.data.orders;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;

  return [];
};

const getStatusStyle = (status) => {
  const styles = {
    placed: "bg-amber-50 text-amber-700 ring-amber-200",
    confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
    shipped: "bg-violet-50 text-violet-700 ring-violet-200",
    delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    cancelled: "bg-red-50 text-red-700 ring-red-200",
  };

  return styles[status] || "bg-gray-100 text-gray-700 ring-gray-200";
};

const getPaymentStatusStyle = (status) => {
  const styles = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    failed: "bg-red-50 text-red-700 ring-red-200",
    refunded: "bg-violet-50 text-violet-700 ring-violet-200",
  };

  return styles[status] || "bg-gray-100 text-gray-700 ring-gray-200";
};

function StatusBadge({ status }) {
  const Icon =
    status === "delivered" || status === "confirmed"
      ? FiCheckCircle
      : status === "cancelled"
        ? FiXCircle
        : status === "shipped"
          ? FiTruck
          : FiClock;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(
        status,
      )}`}
    >
      <Icon size={13} />
      {getStatusLabel(status)}
    </span>
  );
}

function PaymentBadge({ status }) {
  const Icon =
    status === "paid"
      ? FiCheckCircle
      : status === "failed"
        ? FiXCircle
        : status === "refunded"
          ? FiRefreshCw
          : FiClock;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getPaymentStatusStyle(
        status,
      )}`}
    >
      <Icon size={13} />
      {getPaymentStatusLabel(status)}
    </span>
  );
}

function OrderItem({ item, index }) {
  const [imageFailed, setImageFailed] = useState(false);

  const image = item?.image || item?.product?.image || "";
  const name = item?.name || item?.product?.name || "Furniture item";
  const quantity = Number(item?.quantity || 1);
  const price = Number(item?.price || 0);

  return (
    <div
      key={item?._id || item?.product?._id || index}
      className="flex items-center gap-3"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f1f1ec]">
        {image && !imageFailed ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <FiPackage size={20} className="text-[#849086]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="mt-1 text-xs text-[#849086]">
          {formatPrice(price)} × {quantity}
        </p>
      </div>

      <p className="shrink-0 text-sm font-semibold tabular-nums">
        {formatPrice(price * quantity)}
      </p>
    </div>
  );
}

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const fetchOrders = useCallback(async (showRefresh = false) => {
    const token = getToken();

    if (!token) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      toast.error("Please sign in with your admin account.");
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    }

    try {
      const response = await axios.get(`${API_URL}/orders/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 20000,
      });

      setOrders(getOrderList(response));
    } catch (error) {
      toast.error(getErrorMessage(error) || "Unable to load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        const token = getToken();

        if (!token) {
          if (active) {
            setOrders([]);
            setLoading(false);
            toast.error("Please sign in with your admin account.");
          }
          return;
        }

        const response = await axios.get(`${API_URL}/orders/admin/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 20000,
        });

        if (active) {
          setOrders(getOrderList(response));
        }
      } catch (error) {
        if (active) {
          toast.error(getErrorMessage(error));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      active = false;
    };
  }, []);

  const updateOrderStatus = async (orderId, orderStatus) => {
    const currentOrder = orders.find((order) => getOrderId(order) === orderId);

    if (!currentOrder) {
      toast.error("Order not found.");
      return;
    }

    if (!ORDER_STATUSES.some((item) => item.value === orderStatus)) {
      toast.error("Invalid order status.");
      return;
    }

    const currentStatus = getStatus(currentOrder);

    if (["cancelled", "delivered"].includes(currentStatus)) {
      toast.error(`A ${currentStatus} order cannot be updated.`);
      return;
    }

    if (currentStatus === orderStatus) return;

    const token = getToken();

    if (!token) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }

    setUpdatingOrderId(orderId);

    try {
      const response = await axios.put(
        `${API_URL}/orders/admin/${orderId}/status`,
        { orderStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 20000,
        },
      );

      const updatedOrder =
        response?.data?.order || response?.data?.data?.order || null;

      setOrders((currentOrders) =>
        currentOrders.map((order) => {
          if (getOrderId(order) !== orderId) return order;

          return {
            ...order,
            ...(updatedOrder || {}),
            orderStatus: updatedOrder?.orderStatus || orderStatus,
          };
        }),
      );

      toast.success(
        response?.data?.message || "Order status updated successfully.",
      );

      await fetchOrders(true);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to update order status.");
    } finally {
      setUpdatingOrderId("");
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    const currentOrder = orders.find((order) => getOrderId(order) === orderId);

    if (!currentOrder) {
      toast.error("Order not found.");
      return;
    }

    if (!PAYMENT_STATUSES.some((item) => item.value === paymentStatus)) {
      toast.error("Invalid payment status.");
      return;
    }

    const currentPaymentStatus = getPaymentStatus(currentOrder);

    if (currentPaymentStatus === paymentStatus) return;

    if (getStatus(currentOrder) === "cancelled" && paymentStatus === "paid") {
      toast.error("A cancelled order cannot be marked as paid.");
      return;
    }

    if (paymentStatus === "refunded" && currentPaymentStatus !== "paid") {
      toast.error("Only a paid order can be marked as refunded.");
      return;
    }

    const token = getToken();

    if (!token) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }

    setUpdatingOrderId(orderId);

    try {
      const response = await axios.put(
        `${API_URL}/orders/admin/${orderId}/payment-status`,
        { paymentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 20000,
        },
      );

      const updatedOrder =
        response?.data?.order || response?.data?.data?.order || null;

      setOrders((currentOrders) =>
        currentOrders.map((order) => {
          if (getOrderId(order) !== orderId) return order;

          return {
            ...order,
            ...(updatedOrder || {}),
            paymentStatus: updatedOrder?.paymentStatus || paymentStatus,
          };
        }),
      );

      toast.success(
        response?.data?.message || "Payment status updated successfully.",
      );

      await fetchOrders(true);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to update payment status.");
    } finally {
      setUpdatingOrderId("");
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...orders]
      .filter((order) => {
        const status = getStatus(order);
        const paymentStatus = getPaymentStatus(order);

        if (statusFilter !== "all" && status !== statusFilter) {
          return false;
        }

        if (paymentFilter !== "all" && paymentStatus !== paymentFilter) {
          return false;
        }

        if (!query) return true;

        const searchable = [
          getOrderNumber(order),
          getOrderId(order),
          getCustomerName(order),
          getCustomerEmail(order),
          order?.shippingAddress?.phone,
          order?.shippingAddress?.city,
          ...getOrderItems(order).map(
            (item) => item?.name || item?.product?.name,
          ),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
      .sort((a, b) => {
        const dateA = new Date(a?.createdAt || 0).getTime();
        const dateB = new Date(b?.createdAt || 0).getTime();

        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [orders, search, statusFilter, paymentFilter, sortOrder]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      placed: orders.filter((order) => getStatus(order) === "placed").length,
      shipped: orders.filter((order) => getStatus(order) === "shipped").length,
      delivered: orders.filter((order) => getStatus(order) === "delivered")
        .length,
      pendingPayments: orders.filter(
        (order) => getPaymentStatus(order) === "pending",
      ).length,
    }),
    [orders],
  );

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setSortOrder("newest");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f4] px-4 py-6 text-[#263c30] sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/admin"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#748176] transition hover:text-[#294637]"
        >
          <FiArrowLeft size={16} />
          Admin dashboard
        </Link>

        {/* Header */}
        <header className="relative overflow-hidden rounded-3xl bg-[#183d32] px-5 py-7 text-white sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-12 h-44 w-44 rounded-full border border-white/10" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-[#dce7dc]">
                <FiShoppingBag size={14} />
                Furnispace admin workspace
              </span>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Order management
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#d2dfd4]">
                Review customer orders, monitor deliveries, and manage order and
                payment statuses.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchOrders(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            >
              <FiRefreshCw
                className={refreshing ? "animate-spin" : ""}
                size={16}
              />
              Refresh orders
            </button>
          </div>
        </header>

        {/* Statistics */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            {
              label: "All orders",
              value: stats.total,
              icon: FiShoppingBag,
              iconStyle: "bg-[#eaf0e8] text-[#42654a]",
            },
            {
              label: "New orders",
              value: stats.placed,
              icon: FiClock,
              iconStyle: "bg-amber-50 text-amber-700",
            },
            {
              label: "Shipped",
              value: stats.shipped,
              icon: FiTruck,
              iconStyle: "bg-violet-50 text-violet-700",
            },
            {
              label: "Delivered",
              value: stats.delivered,
              icon: FiCheckCircle,
              iconStyle: "bg-emerald-50 text-emerald-700",
            },
            {
              label: "Pending payments",
              value: stats.pendingPayments,
              icon: FiClock,
              iconStyle: "bg-amber-50 text-amber-700",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#e8e9e2] bg-white p-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#849086] sm:text-sm">
                    {stat.label}
                  </span>

                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.iconStyle}`}
                  >
                    <Icon size={18} />
                  </span>
                </div>

                <p className="mt-3 text-2xl font-semibold tabular-nums sm:text-3xl">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* Search and filters */}
        <section className="mt-6 rounded-3xl border border-[#e5e7df] bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Customer orders</h2>
              <p className="mt-1 text-sm text-[#849086]">
                Search, filter, and manage your orders and payments.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex">
              <div className="relative sm:col-span-2 xl:w-72">
                <FiSearch
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#879187]"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search order, customer, product..."
                  className="w-full rounded-xl border border-[#e5e7df] bg-[#fcfcfa] py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-[#a0a89f] focus:border-[#718c70] focus:ring-4 focus:ring-[#718c70]/10"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by order status"
                  className="w-full appearance-none rounded-xl border border-[#e5e7df] bg-[#fcfcfa] py-3 pl-3 pr-9 text-sm outline-none focus:border-[#718c70] sm:min-w-40"
                >
                  <option value="all">All order statuses</option>
                  {ORDER_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <FiChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#879187]"
                />
              </div>

              <div className="relative">
                <select
                  value={paymentFilter}
                  onChange={(event) => setPaymentFilter(event.target.value)}
                  aria-label="Filter by payment status"
                  className="w-full appearance-none rounded-xl border border-[#e5e7df] bg-[#fcfcfa] py-3 pl-3 pr-9 text-sm outline-none focus:border-[#718c70] sm:min-w-40"
                >
                  <option value="all">All payment statuses</option>
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <FiChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#879187]"
                />
              </div>

              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  aria-label="Sort orders"
                  className="w-full appearance-none rounded-xl border border-[#e5e7df] bg-[#fcfcfa] py-3 pl-3 pr-9 text-sm outline-none focus:border-[#718c70] sm:min-w-36"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>

                <FiArrowDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#879187]"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-[#eff0eb] pt-4 text-xs text-[#849086] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing{" "}
              <span className="font-semibold text-[#294637]">
                {filteredOrders.length}
              </span>{" "}
              of {orders.length} orders
            </p>

            {(search ||
              statusFilter !== "all" ||
              paymentFilter !== "all" ||
              sortOrder !== "newest") && (
              <button
                type="button"
                onClick={resetFilters}
                className="self-start font-semibold text-[#42654a] hover:underline sm:self-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        </section>

        {/* Loading state */}
        {loading ? (
          <section className="mt-6 flex min-h-64 items-center justify-center rounded-3xl border border-[#e5e7df] bg-white">
            <div className="flex flex-col items-center gap-3 text-[#849086]">
              <FiRefreshCw size={25} className="animate-spin" />
              <p className="text-sm">Loading orders...</p>
            </div>
          </section>
        ) : filteredOrders.length === 0 ? (
          /* Empty state */
          <section className="mt-6 rounded-3xl border border-[#e5e7df] bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf1e9] text-[#526e55]">
              <FiPackage size={25} />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              {orders.length === 0 ? "No orders yet" : "No matching orders"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#849086]">
              {orders.length === 0
                ? "Customer orders will appear here after an order is successfully placed."
                : "Try a different search term or reset your filters."}
            </p>

            {orders.length > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-full bg-[#294637] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3528]"
              >
                Reset filters
              </button>
            )}
          </section>
        ) : (
          /* Orders list */
          <section className="mt-6 space-y-4">
            {filteredOrders.map((order) => {
              const orderId = getOrderId(order);
              const status = getStatus(order);
              const paymentStatus = getPaymentStatus(order);
              const orderItems = getOrderItems(order);
              const isUpdating = updatingOrderId === orderId;
              const isFinal = ["delivered", "cancelled"].includes(status);

              return (
                <article
                  key={orderId}
                  className="overflow-hidden rounded-3xl border border-[#e5e7df] bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Order header */}
                  <div className="flex flex-col gap-4 border-b border-[#eff0eb] p-4 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#42705a]">
                          Order #{getOrderNumber(order)}
                        </p>

                        <StatusBadge status={status} />
                        <PaymentBadge status={paymentStatus} />
                      </div>

                      <h3 className="mt-3 text-base font-semibold">
                        {getCustomerName(order)}
                      </h3>

                      {getCustomerEmail(order) && (
                        <p className="mt-1 break-all text-sm text-[#849086]">
                          {getCustomerEmail(order)}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-[#849086]">
                        Placed on {formatDate(order?.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-5 lg:justify-end">
                      <div className="lg:text-right">
                        <p className="text-xs text-[#849086]">Order total</p>

                        <p className="mt-1 text-2xl font-semibold tabular-nums">
                          {formatPrice(getOrderTotal(order))}
                        </p>

                        <p className="mt-1 text-xs text-[#849086]">
                          {getItemCount(order)}{" "}
                          {getItemCount(order) === 1 ? "item" : "items"}
                        </p>
                      </div>

                      <Link
                        to={`/orders/${orderId}`}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#e3e6de] px-3 py-2.5 text-xs font-semibold transition hover:border-[#789077] hover:bg-[#f7f8f4] sm:px-4 sm:text-sm"
                      >
                        <FiEye size={16} />
                        <span className="hidden sm:inline">View order</span>
                        <span className="sm:hidden">View</span>
                      </Link>
                    </div>
                  </div>

                  {/* Order contents and management */}
                  <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
                    <div className="min-w-0">
                      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#849086]">
                        Order summary
                      </p>

                      {orderItems.length === 0 ? (
                        <p className="text-sm text-[#849086]">
                          No item details available.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {orderItems.map((item, index) => (
                            <OrderItem
                              key={item?._id || item?.product?._id || index}
                              item={item}
                              index={index}
                            />
                          ))}
                        </div>
                      )}

                      {order?.shippingAddress && (
                        <div className="mt-5 rounded-2xl bg-[#f8f8f5] p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#849086]">
                            Delivery address
                          </p>

                          <p className="mt-2 text-sm font-medium">
                            {order.shippingAddress.fullName ||
                              getCustomerName(order)}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#748176]">
                            {[
                              order.shippingAddress.address,
                              order.shippingAddress.city,
                              order.shippingAddress.state,
                              order.shippingAddress.postalCode,
                              order.shippingAddress.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>

                          {order.shippingAddress.phone && (
                            <p className="mt-2 text-xs text-[#748176]">
                              Phone: {order.shippingAddress.phone}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status controls */}
                    <div className="rounded-2xl border border-[#e8e9e2] p-4 sm:p-5">
                      <label
                        htmlFor={`status-${orderId}`}
                        className="text-xs font-semibold uppercase tracking-wider text-[#849086]"
                      >
                        Update order status
                      </label>

                      <div className="relative mt-3">
                        <select
                          id={`status-${orderId}`}
                          value={status}
                          disabled={isUpdating || isFinal}
                          onChange={(event) =>
                            updateOrderStatus(orderId, event.target.value)
                          }
                          className="w-full appearance-none rounded-xl border border-[#e0e3da] bg-[#fbfbf9] px-3 py-3 pr-9 text-sm font-medium outline-none transition focus:border-[#718c70] focus:ring-4 focus:ring-[#718c70]/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {ORDER_STATUSES.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <FiChevronDown
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#849086]"
                        />
                      </div>

                      {isFinal && (
                        <p className="mt-2 text-xs leading-5 text-[#849086]">
                          {status === "delivered"
                            ? "Delivered orders cannot be changed."
                            : "Cancelled orders cannot be changed."}
                        </p>
                      )}

                      <div className="mt-5 border-t border-[#eff0eb] pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <label
                            htmlFor={`payment-${orderId}`}
                            className="text-xs font-semibold uppercase tracking-wider text-[#849086]"
                          >
                            Payment status
                          </label>

                          <PaymentBadge status={paymentStatus} />
                        </div>

                        <div className="relative mt-3">
                          <select
                            id={`payment-${orderId}`}
                            value={paymentStatus}
                            disabled={isUpdating}
                            onChange={(event) =>
                              updatePaymentStatus(orderId, event.target.value)
                            }
                            className="w-full appearance-none rounded-xl border border-[#e0e3da] bg-[#fbfbf9] px-3 py-3 pr-9 text-sm font-medium outline-none transition focus:border-[#718c70] focus:ring-4 focus:ring-[#718c70]/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {PAYMENT_STATUSES.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <FiChevronDown
                            size={15}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#849086]"
                          />
                        </div>

                        {isUpdating && (
                          <p className="mt-2 flex items-center gap-2 text-xs text-[#748176]">
                            <FiRefreshCw className="animate-spin" size={13} />
                            Updating status...
                          </p>
                        )}

                        <p className="mt-2 text-xs leading-5 text-[#849086]">
                          Payment method: {order?.paymentMethod || "COD"}
                        </p>
                      </div>

                      <Link
                        to={`/orders/${orderId}`}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#294637] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1e3528]"
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

        {/* Footer */}
        <footer className="mt-8 flex flex-col gap-3 border-t border-[#e5e7df] py-5 text-xs text-[#849086] sm:flex-row sm:items-center sm:justify-between">
          <p>Furnispace · Order management</p>

          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 font-semibold text-[#42654a] hover:text-[#294637]"
          >
            Manage products
            <FiArrowRight size={14} />
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default ManageOrders;
