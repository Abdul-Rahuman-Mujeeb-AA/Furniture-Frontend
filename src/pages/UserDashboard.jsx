import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  ArrowUpRight,
  Armchair,
  BadgeCheck,
  Box,
  ChevronRight,
  LayoutGrid,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sofa,
  Sparkles,
  Truck,
  UserRound,
  Wallet,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "");

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const getErrorMessage = (error, fallback) => {
  if (error?.response?.status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (error?.response?.status === 403) {
    return "You do not have permission to access this information.";
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const getList = (response, key) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data?.[key])) return data.data[key];
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

const getImage = (product) => {
  const image = product?.images?.[0];

  if (typeof image === "string") return image;

  return (
    image?.url ||
    product?.image ||
    product?.imageUrl ||
    product?.thumbnail ||
    ""
  );
};

const getCategoryName = (product) =>
  typeof product?.category === "object"
    ? product.category?.name || "Furniture"
    : product?.category || "Furniture";

const getOrderStatus = (order) =>
  order?.orderStatus || order?.status || "placed";

const getOrderItems = (order) =>
  Array.isArray(order?.orderItems)
    ? order.orderItems
    : Array.isArray(order?.items)
      ? order.items
      : [];

const getOrderTotal = (order) =>
  Number(order?.totalAmount ?? order?.totalPrice ?? order?.total ?? 0);

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusClasses = (status) => {
  const value = String(status).toLowerCase();

  if (value === "delivered") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (value === "cancelled") {
    return "bg-red-50 text-red-700";
  }

  if (value === "shipped") {
    return "bg-blue-50 text-blue-700";
  }

  if (value === "confirmed") {
    return "bg-indigo-50 text-indigo-700";
  }

  return "bg-amber-50 text-amber-700";
};

function UserDashboard() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [productError, setProductError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // The request is awaited before any state update.
  const loadProducts = useCallback(async () => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please sign in to view products.");
      }

      const response = await axios.get(`${API_URL}/products`, {
        headers: getHeaders(),
        timeout: 25000,
      });

      setProducts(getList(response, "products"));
      setProductError("");
    } catch (error) {
      setProductError(getErrorMessage(error, "Products could not be loaded."));
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Matches the backend GET /api/orders/my-orders endpoint.
  const loadOrders = useCallback(async () => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please sign in to view your orders.");
      }

      const response = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: getHeaders(),
        timeout: 25000,
      });

      setOrders(getList(response, "orders"));
      setOrderError("");
    } catch (error) {
      setOrderError(getErrorMessage(error, "Your orders could not be loaded."));
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    if (!getToken()) return;

    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: getHeaders(),
        timeout: 25000,
      });

      const data = response?.data;
      const profile = data?.user || data?.data?.user || data?.data || data;

      if (profile && typeof profile === "object") {
        setUser((previous) => ({
          ...(previous || {}),
          ...profile,
        }));

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...(user || {}),
            ...profile,
          }),
        );
      }
    } catch (error) {
      console.error(
        "Unable to load user profile:",
        getErrorMessage(error, "Unable to load profile."),
      );
    }
  }, [user]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      // Start requests after the effect has returned.
      await Promise.resolve();

      if (!active) return;

      await Promise.all([loadProducts(), loadOrders(), loadProfile()]);
    };

    void run();

    return () => {
      active = false;
    };
  }, [loadProducts, loadOrders, loadProfile]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return products
      .filter((product) => {
        if (!search) return true;

        return [product?.name, product?.brand, getCategoryName(product)].some(
          (value) =>
            String(value || "")
              .toLowerCase()
              .includes(search),
        );
      })
      .slice(0, 4);
  }, [products, searchTerm]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b?.createdAt || 0).getTime() -
            new Date(a?.createdAt || 0).getTime(),
        )
        .slice(0, 4),
    [orders],
  );

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + getOrderTotal(order), 0),
    [orders],
  );

  const activeOrders = useMemo(
    () =>
      orders.filter((order) =>
        ["placed", "confirmed", "shipped"].includes(
          String(getOrderStatus(order)).toLowerCase(),
        ),
      ).length,
    [orders],
  );

  const firstName =
    String(user?.name || user?.fullName || "")
      .trim()
      .split(/\s+/)[0] || "there";

  return (
    <div className="min-h-screen bg-[#f7f8f4]">
      <div className="mx-auto max-w-7xl space-y-9 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-3xl bg-[#294637] px-6 py-9 text-white sm:px-10 lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-40 border-white/5" />

          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-[#dce8d8]">
                <Sparkles size={15} />
                YOUR PERSONAL FURNITURE SPACE
              </span>

              <p className="mt-6 text-sm text-[#c7d8c6]">
                Welcome back, {firstName}
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                Make room for
                <span className="mt-1 block font-light italic text-[#d8c69b]">
                  better living.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-[#d2dfd2] sm:text-base">
                Discover furniture for your home, check your order progress, and
                find pieces that suit your space.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-[#e1ead7] px-6 py-3.5 text-sm font-bold text-[#294637] hover:bg-white"
                >
                  Explore furniture <ArrowRight size={17} />
                </Link>

                <Link
                  to="/my-orders"
                  className="rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold hover:bg-white/10"
                >
                  Track my orders
                </Link>
              </div>
            </div>

            <div className="hidden items-center justify-center lg:flex">
              <div className="flex h-56 w-56 items-center justify-center rounded-full border border-white/20 bg-white/5">
                <Sofa size={110} strokeWidth={0.9} className="text-[#e1ead7]" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#819382]">
                Your overview
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#294637] sm:text-3xl">
                Your space at a glance
              </h2>
            </div>

            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#507257]"
            >
              Account details <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Total orders",
                value: loadingOrders ? "—" : orders.length,
                note: "View your orders",
                to: "/my-orders",
                icon: Package,
                color: "bg-[#eaf1e7] text-[#42664a]",
              },
              {
                title: "Active orders",
                value: loadingOrders ? "—" : activeOrders,
                note: "Track progress",
                to: "/my-orders",
                icon: Truck,
                color: "bg-[#f8f0df] text-[#9c7739]",
              },
              {
                title: "Total order value",
                value: loadingOrders ? "—" : formatPrice(totalSpent),
                note: "Combined order value",
                to: "/my-orders",
                icon: Wallet,
                color: "bg-[#e9edf9] text-[#596eab]",
              },
              {
                title: "Membership",
                value: "Customer",
                note: "Manage profile",
                to: "/profile",
                icon: UserRound,
                color: "bg-[#f7eae6] text-[#a46657]",
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-3xl border border-[#e7ece4] bg-white p-5 sm:p-6"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.color}`}
                  >
                    <Icon size={22} />
                  </span>

                  <p className="mt-5 text-sm text-[#819083]">{stat.title}</p>

                  <p className="mt-1 wrap-break-words text-2xl font-bold text-[#294637]">
                    {stat.value}
                  </p>

                  <Link
                    to={stat.to}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#507257]"
                  >
                    {stat.note} <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Browse furniture",
              description: "Explore the store catalogue",
              to: "/products",
              icon: ShoppingBag,
            },
            {
              title: "Shop by category",
              description: "Find furniture for every room",
              to: "/categories",
              icon: LayoutGrid,
            },
            {
              title: "View your cart",
              description: "Review items before checkout",
              to: "/cart",
              icon: ShoppingCart,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                to={item.to}
                className="group flex items-center gap-4 rounded-3xl border border-[#e7ece4] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf1e7] text-[#42664a]">
                  <Icon size={23} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-[#294637]">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[#879688]">
                    {item.description}
                  </span>
                </span>

                <ChevronRight
                  size={18}
                  className="shrink-0 text-[#91a091] transition group-hover:translate-x-1"
                />
              </Link>
            );
          })}
        </section>

        <section>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#819382]">
                The collection
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#294637] sm:text-3xl">
                Furniture for your home
              </h2>
              <p className="mt-2 text-sm text-[#819083]">
                Products added by your store administrator.
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#507257]"
            >
              View all products <ArrowRight size={17} />
            </Link>
          </div>

          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#e7ece4] bg-white px-4 py-3.5 sm:max-w-md">
            <Search size={19} className="text-[#92a092]" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search furniture or category..."
              aria-label="Search furniture"
              className="w-full bg-transparent text-sm text-[#294637] outline-none placeholder:text-[#a0aca0]"
            />
          </div>

          {loadingProducts ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl border border-[#e7ece4] bg-white"
                >
                  <div className="aspect-4/3 animate-pulse bg-[#e9eee6]" />
                  <div className="space-y-3 p-5">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-[#e9eee6]" />
                    <div className="h-5 w-3/4 animate-pulse rounded bg-[#e9eee6]" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-[#e9eee6]" />
                  </div>
                </div>
              ))}
            </div>
          ) : productError ? (
            <div className="rounded-3xl border border-red-100 bg-white px-6 py-10 text-center">
              <Package size={32} className="mx-auto text-red-600" />
              <h3 className="mt-4 font-bold text-[#294637]">
                Could not load products
              </h3>
              <p className="mt-2 text-sm text-[#819083]">{productError}</p>
              <button
                type="button"
                onClick={() => {
                  setLoadingProducts(true);
                  setProductError("");
                  void loadProducts();
                }}
                className="mt-5 rounded-full bg-[#294637] px-5 py-3 text-sm font-semibold text-white"
              >
                Try again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-[#e7ece4] bg-white px-6 py-12 text-center">
              <Armchair size={36} className="mx-auto text-[#93a392]" />
              <h3 className="mt-4 font-bold text-[#294637]">
                {searchTerm ? "No matching furniture" : "No products yet"}
              </h3>
              <p className="mt-2 text-sm text-[#819083]">
                {searchTerm
                  ? "Try another product name, brand, or category."
                  : "Products will appear here when the administrator adds them."}
              </p>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-sm font-semibold text-[#507257] underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {filteredProducts.map((product, index) => {
                const id = product._id || product.id || index;
                const image = getImage(product);
                const price = Number(product.price) || 0;
                const discountPrice = Number(product.discountPrice) || 0;
                const hasDiscount = discountPrice > 0 && discountPrice < price;
                const path = `/products/${product._id || product.id}`;

                return (
                  <article
                    key={id}
                    className="group overflow-hidden rounded-3xl border border-[#e7ece4] bg-white transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link
                      to={path}
                      className="relative block overflow-hidden bg-[#eef1eb]"
                    >
                      <div className="aspect-4/3">
                        {image ? (
                          <img
                            src={image}
                            alt={product.name || "Furniture"}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#9aab98]">
                            <Sofa size={48} strokeWidth={1.1} />
                          </div>
                        )}
                      </div>

                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase text-[#42664a]">
                        {getCategoryName(product)}
                      </span>

                      {hasDiscount && (
                        <span className="absolute right-3 top-3 rounded-full bg-[#294637] px-3 py-1.5 text-[10px] font-bold text-white">
                          Special price
                        </span>
                      )}
                    </Link>

                    <div className="p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#91a091]">
                        {product.brand || "Furnispace collection"}
                      </p>

                      <Link to={path} className="mt-2 block">
                        <h3 className="line-clamp-2 min-h-12 font-bold leading-6 text-[#294637] group-hover:text-[#52785a]">
                          {product.name || "Furniture item"}
                        </h3>
                      </Link>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-lg font-bold text-[#294637]">
                            {formatPrice(hasDiscount ? discountPrice : price)}
                          </p>
                          {hasDiscount && (
                            <p className="text-xs text-[#9aa89a] line-through">
                              {formatPrice(price)}
                            </p>
                          )}
                        </div>

                        <Link
                          to={path}
                          aria-label={`View ${product.name || "product"}`}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf1e7] text-[#42664a] hover:bg-[#294637] hover:text-white"
                        >
                          <ArrowUpRight size={19} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#819382]">
                Order activity
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#294637] sm:text-3xl">
                Your recent orders
              </h2>
            </div>

            <Link
              to="/my-orders"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#507257]"
            >
              All orders <ArrowRight size={17} />
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#e7ece4] bg-white">
            {loadingOrders ? (
              <div className="space-y-4 p-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="h-12 w-12 animate-pulse rounded-2xl bg-[#e9eee6]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 animate-pulse rounded bg-[#e9eee6]" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-[#e9eee6]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : orderError ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-[#819083]">{orderError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoadingOrders(true);
                    setOrderError("");
                    void loadOrders();
                  }}
                  className="mt-4 rounded-full border border-[#dce5d9] px-5 py-2.5 text-sm font-semibold text-[#42664a]"
                >
                  Try again
                </button>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <ShoppingBag size={30} className="mx-auto text-[#527257]" />
                <h3 className="mt-4 font-bold text-[#294637]">
                  Your first order starts here
                </h3>
                <p className="mt-2 text-sm text-[#819083]">
                  Your order details and status will appear here after you place
                  an order.
                </p>
                <Link
                  to="/products"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#294637] px-5 py-3 text-sm font-semibold text-white"
                >
                  Explore products <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              recentOrders.map((order, index) => {
                const id = order._id || order.id;
                const status = getOrderStatus(order);
                const items = getOrderItems(order);
                const itemCount = items.reduce(
                  (sum, item) => sum + Number(item?.quantity || item?.qty || 1),
                  0,
                );

                return (
                  <div
                    key={id || index}
                    className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
                      index ? "border-t border-[#edf0ea]" : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0f4ee] text-[#527257]">
                        <Box size={22} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#294637]">
                          Order #
                          {String(id || "—")
                            .slice(-8)
                            .toUpperCase()}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-[#8a998c]">
                          <span>{formatDate(order.createdAt)}</span>
                          <span>
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="sm:text-right">
                        <p className="font-bold text-[#294637]">
                          {formatPrice(getOrderTotal(order))}
                        </p>
                        <span
                          className={`mt-1.5 inline-flex rounded-full px-3 py-1 text-[10px] font-bold capitalize ${getStatusClasses(status)}`}
                        >
                          {status}
                        </span>
                      </div>

                      <Link
                        to={id ? `/orders/${id}` : "/my-orders"}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#e0e8dd] px-4 py-2.5 text-xs font-bold text-[#42664a] hover:bg-[#f0f4ee]"
                      >
                        Details <ChevronRight size={15} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-4 rounded-3xl border border-[#e7ece4] bg-white p-5 sm:p-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eaf1e7] text-[#42664a]">
              <BadgeCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-[#294637]">
                Store-managed catalogue
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#819083]">
                Product listings and availability are managed by the store
                administrator.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-3xl border border-[#e7ece4] bg-white p-5 sm:p-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7f0e4] text-[#9b7a46]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-[#294637]">
                Your account, in one place
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#819083]">
                Review your profile, revisit orders, and manage your shopping
                journey from your dashboard.
              </p>
              <Link
                to="/profile"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#507257]"
              >
                Account settings <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserDashboard;
