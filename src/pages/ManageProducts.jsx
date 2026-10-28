import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiPackage,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "");

const PAGE_SIZE = 10;

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken");

const getProducts = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data?.products)) return data.data.products;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getCategories = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.data?.categories)) return data.data.categories;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getImage = (product) => {
  if (Array.isArray(product.images) && product.images.length) {
    const image = product.images[0];
    return typeof image === "string"
      ? image
      : image?.url || image?.secure_url || "";
  }

  if (typeof product.image === "string") return product.image;
  if (product.image && typeof product.image === "object") {
    return product.image.url || product.image.secure_url || "";
  }

  return "";
};

const getCategoryName = (category, categories) => {
  if (!category) return "Uncategorized";

  if (typeof category === "object") {
    return category.name || category.title || "Uncategorized";
  }

  const found = categories.find(
    (item) => String(item._id) === String(category),
  );

  return found?.name || found?.title || "Uncategorized";
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const errorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch products and categories.
  // Do not synchronously update loading state at the start of the effect.
  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [productResult, categoryResult] = await Promise.allSettled([
        axios.get(`${API_URL}/products`, { headers }),
        axios.get(`${API_URL}/categories`, { headers }),
      ]);

      if (productResult.status === "rejected") {
        throw productResult.reason;
      }

      setProducts(getProducts(productResult.value.data));

      if (categoryResult.status === "fulfilled") {
        setCategories(getCategories(categoryResult.value.data));
      } else {
        setCategories([]);
        console.error("Categories could not be loaded:", categoryResult.reason);
      }

      if (isRefresh) toast.success("Products refreshed");
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [productResult, categoryResult] = await Promise.allSettled([
          axios.get(`${API_URL}/products`, { headers }),
          axios.get(`${API_URL}/categories`, { headers }),
        ]);

        if (!active) return;

        if (productResult.status === "rejected") {
          throw productResult.reason;
        }

        setProducts(getProducts(productResult.value.data));

        if (categoryResult.status === "fulfilled") {
          setCategories(getCategories(categoryResult.value.data));
        } else {
          setCategories([]);
          console.error(
            "Categories could not be loaded:",
            categoryResult.reason,
          );
        }
      } catch (error) {
        if (active) {
          console.error("Failed to fetch products:", error);
          toast.error(errorMessage(error));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    const term = search.trim().toLowerCase();

    if (term) {
      result = result.filter((product) =>
        [product.name, product.brand, product._id].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(term),
        ),
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((product) => {
        const categoryId =
          typeof product.category === "object"
            ? product.category?._id
            : product.category;

        return String(categoryId || "") === categoryFilter;
      });
    }

    if (stockFilter === "in-stock") {
      result = result.filter((product) => Number(product.stock) > 0);
    } else if (stockFilter === "out-of-stock") {
      result = result.filter((product) => Number(product.stock) <= 0);
    } else if (stockFilter === "low-stock") {
      result = result.filter(
        (product) => Number(product.stock) > 0 && Number(product.stock) <= 5,
      );
    }

    if (statusFilter === "featured") {
      result = result.filter((product) => product.isFeatured === true);
    } else if (statusFilter === "regular") {
      result = result.filter((product) => !product.isFeatured);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "price-low":
          return Number(a.price || 0) - Number(b.price || 0);
        case "price-high":
          return Number(b.price || 0) - Number(a.price || 0);
        case "name":
          return String(a.name || "").localeCompare(String(b.name || ""));
        case "stock-low":
          return Number(a.stock || 0) - Number(b.stock || 0);
        case "newest":
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return result;
  }, [products, search, categoryFilter, stockFilter, statusFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );

  // Clamp the page during rendering instead of using setCurrentPage
  // in an effect.
  const safePage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, safePage]);

  const stats = useMemo(
    () => ({
      total: products.length,
      inStock: products.filter((p) => Number(p.stock) > 0).length,
      outOfStock: products.filter((p) => Number(p.stock) <= 0).length,
      featured: products.filter((p) => p.isFeatured === true).length,
      inventoryValue: products.reduce(
        (total, p) =>
          total + Number(p.price || 0) * Math.max(0, Number(p.stock || 0)),
        0,
      ),
    }),
    [products],
  );

  const handleDelete = async () => {
    if (!deleteTarget?._id || deleting) return;

    setDeleting(true);

    try {
      const token = getToken();

      await axios.delete(`${API_URL}/products/${deleteTarget._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setProducts((previous) =>
        previous.filter((p) => p._id !== deleteTarget._id),
      );

      setDeleteTarget(null);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error(errorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStockFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const updateSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const updateCategory = (value) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const updateStock = (value) => {
    setStockFilter(value);
    setCurrentPage(1);
  };

  const updateStatus = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const updateSort = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const startItem = filteredProducts.length
    ? (safePage - 1) * PAGE_SIZE + 1
    : 0;

  const endItem = Math.min(safePage * PAGE_SIZE, filteredProducts.length);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold text-amber-700">
              ADMINISTRATION
            </p>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Manage Products
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Search, edit and manage your furniture inventory.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fetchProducts(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800"
            >
              <FiPlus />
              Add Product
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Products"
            value={stats.total}
            color="text-blue-700 bg-blue-50"
          />
          <StatCard
            title="In Stock"
            value={stats.inStock}
            color="text-green-700 bg-green-50"
          />
          <StatCard
            title="Out of Stock"
            value={stats.outOfStock}
            color="text-red-700 bg-red-50"
          />
          <StatCard
            title="Featured Products"
            value={stats.featured}
            color="text-amber-800 bg-amber-50"
          />
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Estimated Inventory Value</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {money(stats.inventoryValue)}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">Product Inventory</h2>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-label="Table view"
                className={`rounded-lg p-2 ${viewMode === "table" ? "bg-amber-100 text-amber-800" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <FiList size={18} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`rounded-lg p-2 ${viewMode === "grid" ? "bg-amber-100 text-amber-800" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <FiGrid size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => updateSearch(e.target.value)}
                placeholder="Search name, brand or ID..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-amber-600"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => updateCategory(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name || category.title || "Unnamed Category"}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => updateStock(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="all">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock (1–5)</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => updateStatus(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="all">All Products</option>
              <option value="featured">Featured</option>
              <option value="regular">Regular</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => updateSort(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name: A to Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock-low">Stock: Low to High</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              <FiX />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Products */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-amber-200 border-t-amber-700" />
              <p className="text-sm text-gray-500">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <FiPackage className="mb-3 text-4xl text-gray-300" />
              <h3 className="font-semibold text-gray-800">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Change your filters or add a new product.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 text-sm font-semibold text-amber-800 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="min-w-237.5 w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedProducts.map((product) => {
                    const image = getImage(product);
                    const stock = Number(product.stock || 0);
                    const price = Number(product.price || 0);
                    const discount = Number(product.discountPrice || 0);

                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {image ? (
                              <img
                                src={image}
                                alt={product.name || "Product"}
                                loading="lazy"
                                className="h-14 w-14 rounded-lg border object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                                <FiPackage size={22} />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">
                                {product.name || "Unnamed Product"}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {product.brand || "No brand"}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                ID: {String(product._id || "").slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {getCategoryName(product.category, categories)}
                        </td>

                        <td className="px-5 py-4">
                          {discount > 0 && discount < price ? (
                            <>
                              <p className="font-semibold">{money(discount)}</p>
                              <p className="text-xs text-gray-400 line-through">
                                {money(price)}
                              </p>
                            </>
                          ) : (
                            <p className="font-semibold">{money(price)}</p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              stock <= 0
                                ? "bg-red-100 text-red-700"
                                : stock <= 5
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {stock <= 0 ? "Out of stock" : stock}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              product.isFeatured
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {product.isFeatured ? "Featured" : "Regular"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/admin/products/edit/${product._id}`}
                              aria-label="Edit product"
                              className="rounded-lg border p-2 text-blue-700 hover:bg-blue-50"
                            >
                              <FiEdit2 />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(product)}
                              aria-label="Delete product"
                              className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product) => {
                const image = getImage(product);
                const price = Number(product.price || 0);
                const discount = Number(product.discountPrice || 0);
                const stock = Number(product.stock || 0);

                return (
                  <article
                    key={product._id}
                    className="overflow-hidden rounded-xl border border-gray-200 hover:shadow-md"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={product.name || "Product"}
                        loading="lazy"
                        className="h-48 w-full bg-gray-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                        <FiPackage size={40} />
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">
                        {product.name || "Unnamed Product"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {getCategoryName(product.category, categories)}
                      </p>
                      <p className="mt-3 font-bold text-gray-900">
                        {discount > 0 && discount < price
                          ? money(discount)
                          : money(price)}
                      </p>
                      <p
                        className={`mt-2 text-sm ${
                          stock <= 0
                            ? "text-red-600"
                            : stock <= 5
                              ? "text-amber-700"
                              : "text-green-700"
                        }`}
                      >
                        {stock <= 0 ? "Out of stock" : `Stock: ${stock}`}
                      </p>

                      <div className="mt-4 flex gap-2 border-t pt-4">
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-700 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-800"
                        >
                          <FiEdit2 />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          <FiTrash2 />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Showing {startItem}–{endItem} of {filteredProducts.length}{" "}
                products
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={safePage <= 1}
                  aria-label="Previous page"
                  className="rounded-lg border p-2 disabled:opacity-40"
                >
                  <FiChevronLeft />
                </button>
                <span className="text-sm text-gray-600">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={safePage >= totalPages}
                  aria-label="Next page"
                  className="rounded-lg border p-2 disabled:opacity-40"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FiTrash2 size={22} />
            </div>

            <h2 id="delete-title" className="text-lg font-bold text-gray-900">
              Delete Product
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Delete <strong>{deleteTarget.name || "this product"}</strong>?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg border px-4 py-2.5 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${color}`}
        >
          <FiPackage />
        </div>
      </div>
    </div>
  );
}
