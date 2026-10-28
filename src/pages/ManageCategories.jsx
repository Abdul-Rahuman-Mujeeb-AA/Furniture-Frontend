import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiX,
  FiFolder,
  FiImage,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "");

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken");

const getCategoryImage = (category) => {
  const image = category?.image;

  if (typeof image === "string" && image.trim()) {
    return image;
  }

  return (
    image?.url ||
    image?.secure_url ||
    category?.imageUrl ||
    category?.imageURL ||
    category?.thumbnail ||
    ""
  );
};

const getCategoryId = (category) => category?._id || category?.id;

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong.";

function CategoryImage({ src, name }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
        <FiImage size={22} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || "Category"}
      className="h-14 w-14 shrink-0 rounded-xl border border-gray-100 bg-gray-50 object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function ManageCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewCategory, setViewCategory] = useState(null);

  const pageSize = 8;

  const fetchCategories = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setRefreshing(true);
    }

    try {
      const token = getToken();

      const response = await axios.get(`${API_URL}/categories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = response.data;

      const categoryList = Array.isArray(data)
        ? data
        : Array.isArray(data?.categories)
          ? data.categories
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.categories)
              ? data.data.categories
              : [];

      setCategories(categoryList);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const token = getToken();

        const response = await axios.get(`${API_URL}/categories`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!active) return;

        const data = response.data;

        const categoryList = Array.isArray(data)
          ? data
          : Array.isArray(data?.categories)
            ? data.categories
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.data?.categories)
                ? data.data.categories
                : [];

        setCategories(categoryList);
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

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = categories.filter((category) => {
      const name = category?.name || "";
      const description = category?.description || "";

      return (
        name.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === "az") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (sortOrder === "za") {
        return (b.name || "").localeCompare(a.name || "");
      }

      if (sortOrder === "oldest") {
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      }

      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });
  }, [categories, search, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / pageSize),
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedCategories = filteredCategories.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const id = getCategoryId(deleteTarget);

    if (!id) {
      toast.error("Category ID is missing.");
      return;
    }

    setDeleting(true);

    try {
      const token = getToken();

      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setCategories((previous) =>
        previous.filter(
          (category) => String(getCategoryId(category)) !== String(id),
        ),
      );

      setDeleteTarget(null);
      setViewCategory(null);
      toast.success("Category deleted successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (category) => {
    const id = getCategoryId(category);

    if (!id) {
      toast.error("Category ID is missing.");
      return;
    }

    navigate(`/admin/categories/edit/${id}`);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Admin / Categories
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              Manage Categories
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Create, view, edit and organize your product categories.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fetchCategories(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/categories/new")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
            >
              <FiPlus size={18} />
              Add Category
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Categories</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {categories.length}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FiFolder size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Search Results</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {filteredCategories.length}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <FiSearch size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and sorting */}
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search categories by name or description..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />
          </div>

          <select
            value={sortOrder}
            onChange={handleSortChange}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-400"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">Name: A to Z</option>
            <option value="za">Name: Z to A</option>
          </select>
        </div>

        {/* Categories table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5 text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center text-sm text-gray-500"
                    >
                      Loading categories...
                    </td>
                  </tr>
                ) : paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <FiFolder size={36} className="mx-auto text-gray-300" />

                      <p className="mt-3 font-semibold text-gray-700">
                        No categories found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Add a category or change your search.
                      </p>

                      {!search && (
                        <button
                          type="button"
                          onClick={() => navigate("/admin/categories/new")}
                          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                        >
                          Add your first category
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((category) => {
                    const id = getCategoryId(category);
                    const image = getCategoryImage(category);

                    return (
                      <tr
                        key={id || category.name}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <CategoryImage
                              key={image || "no-image"}
                              src={image}
                              name={category.name}
                            />

                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900">
                                {category.name || "Unnamed category"}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                ID: {id || "Unavailable"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-sm px-6 py-4">
                          <p className="wrap-break-word text-sm text-gray-600">
                            {category.description || "No description"}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(category.createdAt)}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              title="View category"
                              onClick={() => setViewCategory(category)}
                              className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition hover:bg-gray-100"
                            >
                              <FiEye size={16} />
                            </button>

                            <button
                              type="button"
                              title="Edit category"
                              onClick={() => handleEdit(category)}
                              className="rounded-lg border border-blue-100 p-2.5 text-blue-600 transition hover:bg-blue-50"
                            >
                              <FiEdit2 size={16} />
                            </button>

                            <button
                              type="button"
                              title="Delete category"
                              onClick={() => setDeleteTarget(category)}
                              className="rounded-lg border border-red-100 p-2.5 text-red-600 transition hover:bg-red-50"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredCategories.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Showing {(safePage - 1) * pageSize + 1}–{" "}
                {Math.min(safePage * pageSize, filteredCategories.length)} of{" "}
                {filteredCategories.length} categories
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <FiChevronLeft size={18} />
                </button>

                <span className="px-3 text-sm text-gray-600">
                  Page {safePage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View category modal */}
      {viewCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setViewCategory(null);
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                Category Details
              </h2>

              <button
                type="button"
                onClick={() => setViewCategory(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close category details"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {(() => {
                const image = getCategoryImage(viewCategory);

                return (
                  <div className="flex justify-center">
                    {image ? (
                      <CategoryImage
                        key={image}
                        src={image}
                        name={viewCategory.name}
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                        <FiImage size={32} />
                      </div>
                    )}
                  </div>
                );
              })()}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Name
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {viewCategory.name || "Unnamed category"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm text-gray-600">
                  {viewCategory.description || "No description available."}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Created
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {formatDate(viewCategory.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleEdit(viewCategory)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-700"
              >
                <FiEdit2 size={16} />
                Edit Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <FiTrash2 size={22} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Delete category?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <strong className="text-gray-800">
                {deleteTarget.name || "this category"}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCategories;
