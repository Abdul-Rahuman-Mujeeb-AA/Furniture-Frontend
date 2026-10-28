import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiImage, FiSave, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  brand: "",
  material: "",
  color: "",
  stock: "0",
  isFeatured: false,
};

function getToken() {
  return (
    localStorage.getItem("token") || localStorage.getItem("accessToken") || ""
  );
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        (typeof result === "string" && result) ||
        `Request failed (${response.status})`,
    );
  }

  return result;
}

function getList(result, keys = []) {
  if (Array.isArray(result)) return result;

  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key];
  }

  return [];
}

function getProduct(result) {
  return result?.product || result?.data?.product || result?.data || result;
}

function getImageUrl(image) {
  if (typeof image === "string") return image;

  return (
    image?.url || image?.secure_url || image?.imageUrl || image?.path || ""
  );
}

function getProductImages(product) {
  const images = product?.images || product?.image || [];

  return (Array.isArray(images) ? images : [images])
    .map(getImageUrl)
    .filter(Boolean);
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  step,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        step={step}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
      />
    </label>
  );
}

function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const previewUrlsRef = useRef([]);

  const createPreview = useCallback((file) => {
    const url = URL.createObjectURL(file);
    previewUrlsRef.current.push(url);
    return url;
  }, []);

  const revokePreview = useCallback((url) => {
    URL.revokeObjectURL(url);
    previewUrlsRef.current = previewUrlsRef.current.filter(
      (item) => item !== url,
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFormData() {
      setLoading(true);
      setError("");

      try {
        const categoryResult = await apiRequest("/categories");
        const categoryList = getList(categoryResult, ["categories", "data"]);

        if (!cancelled) {
          setCategories(categoryList);
        }

        if (isEditing) {
          const productResult = await apiRequest(`/products/${id}`);
          const product = getProduct(productResult);

          if (cancelled) return;

          const categoryId =
            product?.category?._id ||
            product?.category?.id ||
            product?.category ||
            "";

          setForm({
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price ?? "",
            discountPrice: product?.discountPrice ?? "",
            category:
              typeof categoryId === "object"
                ? categoryId._id || ""
                : categoryId,
            brand: product?.brand || "",
            material: product?.material || "",
            color: product?.color || "",
            stock: product?.stock ?? "0",
            isFeatured: Boolean(product?.isFeatured),
          });

          setExistingImages(getProductImages(product));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load product information.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFormData();

    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      previewUrlsRef.current = [];
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFiles = (event) => {
    const incomingFiles = Array.from(event.target.files || []);

    // Allow selecting the same file again after a previous selection.
    event.target.value = "";

    if (incomingFiles.length === 0) return;

    const availableSlots =
      MAX_IMAGES - existingImages.length - selectedFiles.length;

    if (availableSlots <= 0) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const validFiles = [];

    for (const file of incomingFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: use JPEG, PNG, WebP, or GIF.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: maximum file size is 5 MB.`);
        continue;
      }

      validFiles.push(file);
    }

    const filesToAdd = validFiles.slice(0, availableSlots);

    if (validFiles.length > availableSlots) {
      toast.error(`Only ${availableSlots} more image(s) can be added.`);
    }

    if (filesToAdd.length === 0) return;

    // Update both states directly in the event handler.
    const newPreviews = filesToAdd.map(createPreview);

    setSelectedFiles((current) => [...current, ...filesToAdd]);
    setPreviews((current) => [...current, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    const previewToRemove = previews[index];

    if (previewToRemove) {
      revokePreview(previewToRemove);
    }

    setSelectedFiles((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );

    setPreviews((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const removeExistingImage = (index) => {
    setExistingImages((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Product name is required.";

    if (!form.description.trim()) {
      return "Product description is required.";
    }

    if (form.price === "" || Number(form.price) < 0) {
      return "Enter a valid product price.";
    }

    if (form.discountPrice !== "" && Number(form.discountPrice) < 0) {
      return "Discount price cannot be negative.";
    }

    if (
      form.discountPrice !== "" &&
      Number(form.discountPrice) > Number(form.price)
    ) {
      return "Discount price cannot exceed the regular price.";
    }

    if (!form.category) return "Please select a category.";

    if (form.stock === "" || Number(form.stock) < 0) {
      return "Enter a valid stock quantity.";
    }

    if (!Number.isInteger(Number(form.stock))) {
      return "Stock quantity must be a whole number.";
    }

    if (existingImages.length + selectedFiles.length > MAX_IMAGES) {
      return `A maximum of ${MAX_IMAGES} images is allowed.`;
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();

      data.append("name", form.name.trim());
      data.append("description", form.description.trim());
      data.append("price", String(Number(form.price)));
      data.append("category", form.category);
      data.append("stock", String(Number(form.stock)));
      data.append("isFeatured", String(form.isFeatured));

      if (form.discountPrice !== "") {
        data.append("discountPrice", String(Number(form.discountPrice)));
      }

      if (form.brand.trim()) {
        data.append("brand", form.brand.trim());
      }

      if (form.material.trim()) {
        data.append("material", form.material.trim());
      }

      if (form.color.trim()) {
        data.append("color", form.color.trim());
      }

      // Existing image URLs retained during editing.
      if (isEditing) {
        data.append("existingImages", JSON.stringify(existingImages));
      }

      selectedFiles.forEach((file) => {
        data.append("images", file);
      });

      await apiRequest(isEditing ? `/products/${id}` : "/products", {
        method: isEditing ? "PUT" : "POST",
        body: data,
      });

      toast.success(
        isEditing
          ? "Product updated successfully."
          : "Product created successfully.",
      );

      navigate("/admin/products");
    } catch (err) {
      const message = err.message || "Unable to save product.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const totalImages = existingImages.length + selectedFiles.length;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-950"
        >
          <FiArrowLeft />
          Back to products
        </button>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Product management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {isEditing ? "Edit product" : "Add new product"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {isEditing
              ? "Update product details, pricing, stock, and images."
              : "Add product details, pricing, stock, and images to your store."}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic information
                </h2>

                <p className="mb-6 mt-1 text-sm text-gray-500">
                  Enter the main details customers will see.
                </p>

                <div className="space-y-5">
                  <Field
                    label="Product name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Modern wooden dining table"
                    required
                  />

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </span>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Describe the product, features, and dimensions..."
                      className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-gray-700">
                        Category <span className="text-red-500">*</span>
                      </span>

                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                      >
                        <option value="">Select category</option>

                        {categories.map((category) => (
                          <option
                            key={category._id || category.id}
                            value={category._id || category.id}
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <Field
                      label="Brand"
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      placeholder="Brand name"
                    />

                    <Field
                      label="Material"
                      name="material"
                      value={form.material}
                      onChange={handleChange}
                      placeholder="e.g. Solid wood"
                    />

                    <Field
                      label="Color"
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      placeholder="e.g. Walnut brown"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pricing and inventory
                </h2>

                <p className="mb-6 mt-1 text-sm text-gray-500">
                  Set the selling price and available quantity.
                </p>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field
                    label="Price (₹)"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />

                  <Field
                    label="Discount price (₹)"
                    name="discountPrice"
                    type="number"
                    value={form.discountPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                  />

                  <Field
                    label="Stock quantity"
                    name="stock"
                    type="number"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    required
                  />
                </div>

                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 accent-gray-900"
                  />

                  <span>
                    <span className="block text-sm font-medium text-gray-900">
                      Featured product
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      Mark this product as featured in your store.
                    </span>
                  </span>
                </label>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Product images
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      JPEG, PNG, WebP, or GIF. Maximum 5 MB per image.
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {totalImages}/{MAX_IMAGES} images
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleFiles}
                  className="hidden"
                />

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {existingImages.map((url, index) => (
                    <div
                      key={`existing-${url}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                    >
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-xs text-white">
                        Saved
                      </span>

                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        aria-label="Remove saved image"
                        className="absolute right-2 top-2 rounded-full bg-white p-2 text-gray-700 shadow hover:bg-red-50 hover:text-red-600"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}

                  {previews.map((url, index) => (
                    <div
                      key={url}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                    >
                      <img
                        src={url}
                        alt={`New product image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-xs text-white">
                        New
                      </span>

                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        aria-label="Remove new image"
                        className="absolute right-2 top-2 rounded-full bg-white p-2 text-gray-700 shadow hover:bg-red-50 hover:text-red-600"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}

                  {totalImages < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-gray-500 hover:bg-gray-100"
                    >
                      <FiImage className="mb-2 text-2xl" />
                      <span className="text-sm font-medium">Add images</span>
                      <span className="mt-1 text-xs">
                        {MAX_IMAGES - totalImages} remaining
                      </span>
                    </button>
                  )}
                </div>

                {totalImages === 0 && (
                  <p className="mt-4 text-xs text-gray-500">
                    Add at least one image if your backend requires product
                    images.
                  </p>
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEditing ? "Save changes" : "Publish product"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Review your product details before saving.
                </p>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiSave />
                  {saving
                    ? "Saving..."
                    : isEditing
                      ? "Update product"
                      : "Create product"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => navigate("/admin/products")}
                  className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-gray-900">
                  Product checklist
                </h2>

                <ul className="mt-4 space-y-3 text-sm">
                  {[
                    ["Product name", Boolean(form.name.trim())],
                    ["Description", Boolean(form.description.trim())],
                    ["Category selected", Boolean(form.category)],
                    [
                      "Price entered",
                      form.price !== "" && Number(form.price) >= 0,
                    ],
                    [
                      "Stock entered",
                      form.stock !== "" && Number(form.stock) >= 0,
                    ],
                    ["Images added", totalImages > 0],
                  ].map(([label, complete]) => (
                    <li key={label} className="flex items-center gap-3">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                          complete
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {complete ? "✓" : "–"}
                      </span>

                      <span
                        className={complete ? "text-gray-800" : "text-gray-500"}
                      >
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
