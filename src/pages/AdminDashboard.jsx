
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  FolderTree,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL
).replace(/\/+$/, "");

const ORDER_DETAILS_PATH = "/orders";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken");

const getOrderRoute = (order) => {
  const id = order?._id || order?.id;

  return id
    ? `${ORDER_DETAILS_PATH}/${encodeURIComponent(String(id))}`
    : "/admin/orders";
};

const getProductStock = (product) =>
  Number(product?.stock ?? 0);

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getOrderId = (order) =>
  String(order?._id || order?.id || "")
    .slice(-8)
    .toUpperCase();

const getOrderItems = (order) => {
  if (Array.isArray(order?.orderItems)) {
    return order.orderItems;
  }

  if (Array.isArray(order?.items)) {
    return order.items;
  }

  return [];
};

const getOrderTotal = (order) =>
  Number(
    order?.totalAmount ??
      order?.total ??
      order?.grandTotal ??
      0
  );

const getOrderStatus = (order) =>
  String(
    order?.orderStatus ||
      order?.status ||
      "placed"
  ).toLowerCase();

const getStatusStyles = (status) => {
  const styles = {
    placed: "bg-amber-50 text-amber-700 ring-amber-600/20",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    confirmed: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    processing: "bg-blue-50 text-blue-700 ring-blue-600/20",
    shipped: "bg-sky-50 text-sky-700 ring-sky-600/20",
    delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    cancelled: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };

  return (
    styles[status] ||
    "bg-slate-100 text-slate-600 ring-slate-500/20"
  );
};

// API request function is outside the component.
// No React state updates happen here.
async function getDashboardData(signal) {
  const token = getToken();

  const config = {
    signal,
    ...(token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {}),
  };

  const [
    productsResponse,
    categoriesResponse,
    ordersResponse,
  ] = await Promise.all([
    axios.get(`${API_URL}/products`, config),
    axios.get(`${API_URL}/categories`, config),
    axios.get(`${API_URL}/orders/admin/all`, config),
  ]);

  const productData =
    productsResponse.data?.products ??
    productsResponse.data?.data?.products ??
    productsResponse.data?.data ??
    productsResponse.data;

  const categoryData =
    categoriesResponse.data?.categories ??
    categoriesResponse.data?.data?.categories ??
    categoriesResponse.data?.data ??
    categoriesResponse.data;

  const orderData =
    ordersResponse.data?.orders ??
    ordersResponse.data?.data?.orders ??
    ordersResponse.data?.data ??
    ordersResponse.data;

  return {
    products: Array.isArray(productData)
      ? productData
      : [],
    categories: Array.isArray(categoryData)
      ? categoryData
      : [],
    orders: Array.isArray(orderData)
      ? orderData
      : [],
  };
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  trend,
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-500">
            {title}
          </p>

          <p className="mt-3 wrap-break-word text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-stone-500">
        {trend && (
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
            <TrendingUp size={14} />
            {trend}
          </span>
        )}

        <span>{description}</span>
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  description,
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 transition hover:border-emerald-800/30 hover:bg-stone-50"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900 transition group-hover:bg-emerald-900 group-hover:text-white">
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-stone-900">
          {title}
        </p>

        <p className="mt-1 text-sm text-stone-500">
          {description}
        </p>
      </div>

      <ArrowRight
        size={18}
        className="shrink-0 text-stone-400 transition group-hover:translate-x-1 group-hover:text-emerald-900"
      />
    </Link>
  );
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Initial load:
  // API work starts asynchronously.
  // No direct synchronous setState inside the effect.
  useEffect(() => {
    const controller = new AbortController();

    async function loadInitialData() {
      try {
        const data = await getDashboardData(
          controller.signal
        );

        if (controller.signal.aborted) return;

        setProducts(data.products);
        setCategories(data.categories);
        setOrders(data.orders);
        setLoadError("");
      } catch (error) {
        if (
          controller.signal.aborted ||
          axios.isCancel(error)
        ) {
          return;
        }

        const message =
          error.response?.data?.message ||
          "Unable to load dashboard data. Please try again.";

        setLoadError(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      controller.abort();
    };
  }, []);

  // Manual refresh:
  // State updates happen in a button event handler,
  // not synchronously inside useEffect.
  const fetchDashboard = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);
    setLoadError("");

    try {
      const data = await getDashboardData();

      setProducts(data.products);
      setCategories(data.categories);
      setOrders(data.orders);

      toast.success("Dashboard updated successfully");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to refresh dashboard data.";

      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalOrders = orders.length;

  const pendingOrders = orders.filter((order) =>
    [
      "placed",
      "pending",
      "processing",
      "confirmed",
    ].includes(getOrderStatus(order))
  ).length;

  const deliveredOrders = orders.filter((order) =>
    ["delivered", "completed"].includes(
      getOrderStatus(order)
    )
  ).length;

  const cancelledOrders = orders.filter(
    (order) =>
      getOrderStatus(order) === "cancelled"
  ).length;

  const lowStockProducts = products.filter((product) => {
    const stock = getProductStock(product);

    return stock > 0 && stock <= 5;
  });

  const outOfStockProducts = products.filter(
    (product) =>
      getProductStock(product) <= 0
  );

  const totalRevenue = orders
    .filter((order) =>
      ["delivered", "completed"].includes(
        getOrderStatus(order)
      )
    )
    .reduce(
      (total, order) =>
        total + getOrderTotal(order),
      0
    );

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b?.createdAt || 0).getTime() -
        new Date(a?.createdAt || 0).getTime()
    )
    .slice(0, 6);

  const customerCount = new Set(
    orders
      .map((order) => {
        const user =
          order?.user || order?.customer;

        if (
          typeof user === "object" &&
          user !== null
        ) {
          return (
            user._id ||
            user.id ||
            user.email
          );
        }

        return user || order?.userId || null;
      })
      .filter(Boolean)
      .map(String)
  ).size;

  const stockOverview = [
    {
      label: "In stock",
      count: products.filter(
        (product) =>
          getProductStock(product) > 5
      ).length,
      color: "bg-emerald-600",
    },
    {
      label: "Low stock",
      count: lowStockProducts.length,
      color: "bg-amber-500",
    },
    {
      label: "Out of stock",
      count: outOfStockProducts.length,
      color: "bg-stone-400",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      {/* HEADER */}
      <section className="bg-[#173d32] text-white">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-50">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Furnispace administration
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Admin dashboard
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100/80 sm:text-base">
                Monitor your furniture store, manage
                inventory, and keep orders moving
                from purchase to delivery.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={fetchDashboard}
                disabled={refreshing || loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <Link
                to="/admin/products/new"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50"
              >
                <Plus size={17} />
                Add product
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* ERROR */}
        {loadError && (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-stone-900">
                Dashboard data could not be loaded
              </p>

              <p className="mt-1 text-sm text-stone-600">
                {loadError}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchDashboard}
              disabled={refreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-60"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* STORE OVERVIEW */}
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                Store overview
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                A snapshot of your store's
                current performance.
              </p>
            </div>

            <span className="hidden items-center gap-1.5 text-xs text-stone-500 sm:inline-flex">
              <CalendarDays size={14} />
              Updated {formatDate(new Date())}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total products"
              value={loading ? "—" : totalProducts}
              description="Products in your catalogue"
              icon={Package}
              accent="bg-emerald-50 text-emerald-800"
              trend={totalProducts ? "Catalogue" : undefined}
            />

            <MetricCard
              title="Total orders"
              value={loading ? "—" : totalOrders}
              description="Orders received"
              icon={ShoppingBag}
              accent="bg-sky-50 text-sky-800"
              trend={totalOrders ? "Sales activity" : undefined}
            />

            <MetricCard
              title="Completed revenue"
              value={
                loading
                  ? "—"
                  : formatCurrency(totalRevenue)
              }
              description="Delivered and completed orders"
              icon={Wallet}
              accent="bg-amber-50 text-amber-800"
              trend={deliveredOrders ? "Completed" : undefined}
            />

            <MetricCard
              title="Pending orders"
              value={loading ? "—" : pendingOrders}
              description="Orders needing attention"
              icon={Clock3}
              accent="bg-violet-50 text-violet-800"
              trend={pendingOrders ? "Action needed" : undefined}
            />
          </div>
        </section>

        {/* ORDER ACTIVITY AND INVENTORY */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">
                  Order activity
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Track the progress of customer orders.
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-900">
                <Truck size={21} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-stone-50 p-4">
                <p className="text-xs font-medium text-stone-500">
                  All orders
                </p>
                <p className="mt-2 text-2xl font-semibold text-stone-900">
                  {loading ? "—" : totalOrders}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-xs font-medium text-amber-800">
                  Pending
                </p>
                <p className="mt-2 text-2xl font-semibold text-amber-900">
                  {loading ? "—" : pendingOrders}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-medium text-emerald-800">
                  Completed
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-900">
                  {loading ? "—" : deliveredOrders}
                </p>
              </div>

              <div className="rounded-xl bg-stone-100 p-4">
                <p className="text-xs font-medium text-stone-500">
                  Cancelled
                </p>
                <p className="mt-2 flex items-center gap-1 text-2xl font-semibold text-stone-700">
                  {loading ? "—" : cancelledOrders}
                  <ArrowDownRight size={17} />
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                  <CreditCard size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    Revenue summary
                  </p>
                  <p className="text-xs text-stone-500">
                    Based on completed orders
                  </p>
                </div>
              </div>

              <p className="text-xl font-semibold text-emerald-900">
                {loading
                  ? "—"
                  : formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>

          {/* INVENTORY HEALTH */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">
                  Inventory health
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Current stock availability.
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-800">
                <Boxes size={21} />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {stockOverview.map((item) => {
                const percentage =
                  totalProducts > 0
                    ? Math.round(
                        (item.count / totalProducts) * 100
                      )
                    : 0;

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm text-stone-600">
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-stone-900">
                        {loading ? "—" : item.count}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className={`h-full rounded-full transition-all ${item.color}`}
                        style={{
                          width: `${loading ? 0 : percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-stone-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    Stock attention
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    Products with five or fewer units
                  </p>
                </div>

                <span className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                  {loading
                    ? "—"
                    : lowStockProducts.length +
                      outOfStockProducts.length}
                </span>
              </div>

              <Link
                to="/admin/products"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:text-emerald-700"
              >
                Manage inventory
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* RECENT ORDERS */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-3 border-b border-stone-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">
                  Recent orders
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  The latest customer purchases.
                </p>
              </div>

              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:text-emerald-700"
              >
                View all
                <ExternalLink size={15} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4 p-6">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-14 animate-pulse rounded-xl bg-stone-100"
                  />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                  <ShoppingBag size={22} />
                </div>
                <h3 className="mt-4 font-semibold text-stone-900">
                  No orders yet
                </h3>
                <p className="mt-2 text-sm text-stone-500">
                  Customer orders will appear here
                  when they arrive.
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-150 text-left">
                    <thead className="bg-stone-50">
                      <tr className="text-xs uppercase tracking-wide text-stone-500">
                        <th className="px-6 py-4 font-semibold">
                          Order
                        </th>
                        <th className="px-6 py-4 font-semibold">
                          Date
                        </th>
                        <th className="px-6 py-4 font-semibold">
                          Total
                        </th>
                        <th className="px-6 py-4 font-semibold">
                          Status
                        </th>
                        <th className="px-6 py-4 font-semibold">
                          Details
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-stone-100">
                      {recentOrders.map((order) => {
                        const status = getOrderStatus(order);

                        return (
                          <tr
                            key={order._id || order.id}
                            className="transition hover:bg-stone-50"
                          >
                            <td className="px-6 py-4">
                              <span className="font-semibold text-stone-900">
                                #{getOrderId(order) || "NEW"}
                              </span>

                              <p className="mt-1 text-xs text-stone-500">
                                {getOrderItems(order).length} item(s)
                              </p>
                            </td>

                            <td className="px-6 py-4 text-sm text-stone-600">
                              {formatDate(order.createdAt)}
                            </td>

                            <td className="px-6 py-4 text-sm font-semibold text-stone-900">
                              {formatCurrency(getOrderTotal(order))}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${getStatusStyles(status)}`}
                              >
                                {status}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <Link
                                to={getOrderRoute(order)}
                                aria-label={`View order ${getOrderId(order)}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition hover:border-emerald-800 hover:text-emerald-900"
                              >
                                <ArrowUpRight size={17} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE */}
                <div className="divide-y divide-stone-100 sm:hidden">
                  {recentOrders.map((order) => {
                    const status = getOrderStatus(order);

                    return (
                      <div
                        key={order._id || order.id}
                        className="space-y-3 p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-stone-900">
                              #{getOrderId(order) || "NEW"}
                            </p>

                            <p className="mt-1 text-xs text-stone-500">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${getStatusStyles(status)}`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-stone-900">
                              {formatCurrency(getOrderTotal(order))}
                            </p>

                            <p className="mt-1 text-xs text-stone-500">
                              {getOrderItems(order).length} item(s)
                            </p>
                          </div>

                          <Link
                            to={getOrderRoute(order)}
                            className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 hover:border-emerald-800 hover:text-emerald-900"
                          >
                            Details
                            <ArrowRight size={15} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-stone-900">
                Quick actions
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Common store management tasks.
              </p>

              <div className="mt-5 space-y-3">
                <QuickAction
                  to="/admin/products/new"
                  icon={Plus}
                  title="Add product"
                  description="List a new furniture item"
                />

                <QuickAction
                  to="/admin/categories/new"
                  icon={FolderTree}
                  title="Add category"
                  description="Organise your catalogue"
                />

                <QuickAction
                  to="/admin/orders"
                  icon={Truck}
                  title="Manage orders"
                  description="Review and update orders"
                />

                <QuickAction
                  to="/admin/products"
                  icon={Package}
                  title="Manage products"
                  description="Edit pricing and stock"
                />
              </div>
            </div>

            {/* CUSTOMERS */}
            <div className="rounded-2xl bg-[#173d32] p-5 text-white sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <Users size={21} />
              </div>

              <p className="mt-5 text-sm text-emerald-100/80">
                Customers represented in orders
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {loading ? "—" : customerCount}
              </p>

              <p className="mt-2 text-sm leading-6 text-emerald-100/70">
                Counted from unique customer
                identifiers available in your order
                records.
              </p>
            </div>

            {/* CATEGORIES */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
                  <FolderTree size={19} />
                </div>

                <div>
                  <h3 className="font-semibold text-stone-900">
                    Categories
                  </h3>

                  <p className="text-sm text-stone-500">
                    Organised product collections
                  </p>
                </div>
              </div>

              <p className="mt-5 text-3xl font-semibold text-stone-900">
                {loading ? "—" : totalCategories}
              </p>

              <Link
                to="/admin/categories"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:text-emerald-700"
              >
                Manage categories
                <ArrowRight size={15} />
              </Link>

              <div className="mt-5 flex items-center gap-2 border-t border-stone-100 pt-4 text-xs text-stone-500">
                <CheckCircle2
                  size={15}
                  className="text-emerald-700"
                />
                Category totals reflect the fetched
                catalogue data.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
