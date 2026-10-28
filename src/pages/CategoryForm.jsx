import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiSave,
  FiFolder,
  FiFileText,
  FiLoader,
  FiUpload,
  FiX,
  FiImage,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken");

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong. Please try again.";

const getCategory = (response) => {
  const data = response?.data;

  if (!data) return null;
  if (data.category) return data.category;
  if (data.data?.category) return data.data.category;
  if (data._id || data.id) return data;
  if (data.data?._id || data.data?.id) return data.data;

  return null;
};

const getCategoryImage = (category) => {
  if (typeof category?.image === "string") {
    return category.image;
  }

  return (
    category?.image?.url ||
    category?.imageUrl ||
    category?.imageURL ||
    category?.thumbnail ||
    ""
  );
};

export default function CategoryForm() {
  const { id } = useParams();

  return <CategoryFormContent key={id || "new"} id={id} />;
}

function CategoryFormContent({ id }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!id) return undefined;

    let active = true;

    const loadCategory = async () => {
      try {
        const token = getToken();

        const response = await axios.get(`${API_URL}/categories/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!active) return;

        const category = getCategory(response);

        if (!category) {
          throw new Error("Category not found.");
        }

        setFormData({
          name: category.name || "",
          description: category.description || "",
        });

        setExistingImage(getCategoryImage(category));
        setLoadError("");
      } catch (error) {
        if (!active) return;

        const message = getErrorMessage(error);
        setLoadError(message);
        toast.error(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCategory();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;

    setSelectedImage(file);
    setPreview(objectUrl);
    setRemoveExistingImage(false);
  };

  const handleRemoveImage = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setSelectedImage(null);
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (existingImage) {
      setRemoveExistingImage(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      toast.error("Category name is required.");
      return;
    }

    if (isEditMode && loadError) {
      toast.error("Load the category successfully before editing.");
      return;
    }

    setSaving(true);

    try {
      const token = getToken();
      const payload = new FormData();

      payload.append("name", name);
      payload.append("description", description);

      // The backend must use a matching Multer field name.
      if (selectedImage) {
        payload.append("image", selectedImage);
      }

      // The backend must explicitly support this field to remove
      // the existing Cloudinary image.
      if (isEditMode && removeExistingImage && !selectedImage) {
        payload.append("removeImage", "true");
      }

      const config = {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      if (isEditMode) {
        await axios.put(`${API_URL}/categories/${id}`, payload, config);

        toast.success("Category updated successfully.");
      } else {
        await axios.post(`${API_URL}/categories`, payload, config);

        toast.success("Category created successfully.");
      }

      navigate("/admin/categories");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-gray-600">
        <FiLoader className="animate-spin text-xl" />
        Loading category...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/admin/categories"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft />
          Back to Categories
        </Link>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-6 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FiFolder className="text-2xl" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "Edit Category" : "Create Category"}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  {isEditMode
                    ? "Update the category details and image."
                    : "Create a category with an optional image."}
                </p>
              </div>
            </div>
          </div>

          {loadError && isEditMode && (
            <div className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:mx-8">
              <p className="font-semibold">Could not load category.</p>
              <p className="mt-1">{loadError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 font-semibold underline"
              >
                Reload page
              </button>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="space-y-6 p-6 sm:p-8"
          >
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Category Name <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <FiFolder className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Living Room Furniture"
                  maxLength={100}
                  required
                  disabled={saving || Boolean(loadError && isEditMode)}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Description
              </label>

              <div className="relative">
                <FiFileText className="pointer-events-none absolute left-3 top-4 text-gray-400" />

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe this category..."
                  rows={4}
                  maxLength={1000}
                  disabled={saving || Boolean(loadError && isEditMode)}
                  className="w-full resize-y rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                />
              </div>

              <p className="mt-1 text-right text-xs text-gray-400">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category Image
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={saving || Boolean(loadError && isEditMode)}
                className="hidden"
              />

              {preview || (existingImage && !removeExistingImage) ? (
                <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  <img
                    src={preview || existingImage}
                    alt="Category preview"
                    className="h-64 w-full object-contain"
                  />

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={saving}
                    aria-label="Remove category image"
                    className="absolute right-3 top-3 rounded-full bg-white p-2 text-red-600 shadow hover:bg-red-50 disabled:opacity-50"
                  >
                    <FiX />
                  </button>

                  {preview && (
                    <p className="px-4 py-2 text-xs text-gray-500">
                      New image selected. It will upload when you save.
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving || Boolean(loadError && isEditMode)}
                  className="flex min-h-48 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-50"
                >
                  <FiImage className="mb-3 text-3xl text-gray-400" />
                  <span className="font-semibold text-gray-700">
                    Choose category image
                  </span>
                  <span className="mt-1 text-sm text-gray-500">
                    JPG, PNG, or WebP · Maximum 5 MB
                  </span>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                    <FiUpload />
                    Select Image
                  </span>
                </button>
              )}

              {(preview || (existingImage && !removeExistingImage)) && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving || Boolean(loadError && isEditMode)}
                  className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                >
                  Replace image
                </button>
              )}

              <p className="mt-2 text-xs text-gray-500">
                The selected image is uploaded through your backend to
                Cloudinary when you save.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
              <Link
                to="/admin/categories"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={
                  saving ||
                  !formData.name.trim() ||
                  Boolean(loadError && isEditMode)
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <FiLoader className="animate-spin" /> : <FiSave />}

                {saving
                  ? "Saving..."
                  : isEditMode
                    ? "Update Category"
                    : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
