import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Package,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";

import productService from "../services/productService";
import cartService from "../services/cartService";
import reviewService from "../services/reviewService";
import ReviewForm from "../components/ReviewForm";

/* =====================================================
   Helpers
===================================================== */

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

const getId = (item) => String(item?._id ?? item?.id ?? "");

const getStoredWishlist = () => {
  try {
    const value = JSON.parse(localStorage.getItem("wishlist") || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const getArray = (response) => {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.reviews)) return data.reviews;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const getObject = (response) => {
  const data = response?.data ?? response;

  if (data?.product) return data.product;
  if (data?.data?.product) return data.data.product;

  if (data?.data && !Array.isArray(data.data)) return data.data;

  return data;
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

const getPrice = (product) =>
  Number(product?.discountPrice ?? product?.salePrice ?? product?.price ?? 0);

const getOriginalPrice = (product) =>
  Number(
    product?.originalPrice ?? product?.regularPrice ?? product?.price ?? 0,
  );

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);

const getImageUrl = (image) => {
  if (!image) return "";

  if (typeof image !== "string") {
    return image.url || image.secure_url || image.imageUrl || image.src || "";
  }

  if (/^(https?:\/\/|data:|blob:)/i.test(image)) {
    return image;
  }

  const baseUrl = API_BASE_URL.replace(/\/api\/?$/i, "");

  return image.startsWith("/") ? `${baseUrl}${image}` : `${baseUrl}/${image}`;
};

const getProductImages = (product) => {
  const images = [
    ...(Array.isArray(product?.images) ? product.images : []),
    ...(product?.image ? [product.image] : []),
    ...(product?.thumbnail ? [product.thumbnail] : []),
  ];

  return [...new Set(images.map(getImageUrl).filter(Boolean))];
};

const getStock = (product) =>
  Number(product?.stock ?? product?.quantity ?? product?.countInStock ?? 0);

const isAbortError = (error) =>
  error?.name === "AbortError" ||
  error?.name === "CanceledError" ||
  error?.code === "ERR_CANCELED";

/* =====================================================
   Rating Stars
===================================================== */

function RatingStars({ rating = 0, count, size = 16 }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= Math.round(value)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>

      <span className="text-sm text-gray-600">{value.toFixed(1)}</span>

      {count !== undefined && (
        <span className="text-sm text-gray-500">({count})</span>
      )}
    </div>
  );
}

/* =====================================================
   Product Image
   No state-resetting useEffect
===================================================== */

function ProductImage({ src, alt, className = "" }) {
  const [failedSrc, setFailedSrc] = useState("");

  const failed = Boolean(src) && failedSrc === src;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-gray-100 ${className}`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={alt || "Furniture product"}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
          <Package size={42} />
          <span className="text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   Review Card
===================================================== */

function ReviewCard({ review }) {
  const reviewer =
    review?.user?.name || review?.userName || review?.name || "Customer";

  const date = review?.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <article className="border-b border-gray-200 py-5 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-medium text-gray-900">{reviewer}</h3>
          {date && <p className="mt-1 text-xs text-gray-500">{date}</p>}
        </div>

        <RatingStars rating={review?.rating} size={14} />
      </div>

      {review?.title && (
        <h4 className="mt-3 font-medium text-gray-800">{review.title}</h4>
      )}

      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
        {review?.comment || review?.review || "No written review provided."}
      </p>
    </article>
  );
}

/* =====================================================
   Specifications
===================================================== */

function Specifications({ product }) {
  const specifications = [
    ["Category", product?.category?.name || product?.category],
    ["Brand", product?.brand],
    ["Material", product?.material],
    ["Color", product?.color],
    ["Dimensions", product?.dimensions],
    ["Weight", product?.weight],
    ["SKU", product?.sku],
  ].filter(
    ([, value]) =>
      value !== undefined && value !== null && String(value).trim() !== "",
  );

  if (!specifications.length) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Specifications
      </h2>

      <dl className="divide-y divide-gray-200 rounded-xl border border-gray-200">
        {specifications.map(([label, value]) => (
          <div key={label} className="grid grid-cols-2 gap-4 px-4 py-3">
            <dt className="text-sm text-gray-500">{label}</dt>
            <dd className="wrap-break-word text-sm font-medium text-gray-800">
              {typeof value === "object" ? JSON.stringify(value) : value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* =====================================================
   Related Product Card
===================================================== */

function RelatedProductCard({ product }) {
  const images = getProductImages(product);
  const price = getPrice(product);
  const originalPrice = getOriginalPrice(product);

  return (
    <Link
      to={`/products/${getId(product)}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md"
    >
      <ProductImage
        src={images[0]}
        alt={product?.name || "Furniture product"}
        className="aspect-square w-full"
      />

      <div className="p-3">
        <h3 className="line-clamp-2 min-h-10 font-medium text-gray-900">
          {product?.name || "Furniture product"}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="font-semibold text-gray-900">
            {formatPrice(price)}
          </span>

          {originalPrice > price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* =====================================================
   Product Details Page
===================================================== */

export default function ProductDetails() {
  const { id } = useParams();

  const requestIdRef = useRef(0);
  const requestControllerRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlist, setWishlist] = useState(getStoredWishlist);

  /* Fetch product information */

  const loadProduct = useCallback(
    async (signal) => {
      const requestId = ++requestIdRef.current;

      const isCurrentRequest = () =>
        !signal?.aborted && requestId === requestIdRef.current;

      try {
        const response = await productService.getProductById(id);

        if (!isCurrentRequest()) return;

        const fetchedProduct = getObject(response);

        if (
          !fetchedProduct ||
          typeof fetchedProduct !== "object" ||
          !getId(fetchedProduct)
        ) {
          throw new Error("Product not found.");
        }

        setProduct(fetchedProduct);
        setQuantity(1);
        setSelectedImage(0);

        const categoryId =
          typeof fetchedProduct.category === "object"
            ? getId(fetchedProduct.category)
            : fetchedProduct.category;

        const [relatedResult, reviewsResult] = await Promise.allSettled([
          categoryId
            ? productService.getProducts({
                category: categoryId,
                limit: 5,
              })
            : Promise.resolve([]),

          reviewService.getProductReviews(id),
        ]);

        if (!isCurrentRequest()) return;

        setRelatedProducts(
          relatedResult.status === "fulfilled"
            ? getArray(relatedResult.value)
                .filter((item) => getId(item) !== getId(fetchedProduct))
                .slice(0, 4)
            : [],
        );

        setReviews(
          reviewsResult.status === "fulfilled"
            ? getArray(reviewsResult.value)
            : [],
        );

        setPageError("");
      } catch (error) {
        if (!isCurrentRequest() || isAbortError(error)) return;

        setPageError(getErrorMessage(error));
        setProduct(null);
        setReviews([]);
        setRelatedProducts([]);
      } finally {
        if (isCurrentRequest()) {
          setLoading(false);
        }
      }
    },
    [id],
  );

  /*
   * Important:
   * Defer the request so the effect itself does not synchronously
   * invoke a function that updates React state.
   */

  useEffect(() => {
    const controller = new AbortController();

    requestControllerRef.current = controller;

    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void loadProduct(controller.signal);
      }
    });

    return () => {
      controller.abort();

      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }
    };
  }, [loadProduct]);

  /* Retry loading */

  const handleRetry = useCallback(() => {
    requestControllerRef.current?.abort();

    const controller = new AbortController();
    requestControllerRef.current = controller;

    setLoading(true);
    setPageError("");

    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void loadProduct(controller.signal);
      }
    });
  }, [loadProduct]);

  /* Derived values */

  const images = useMemo(() => getProductImages(product), [product]);

  const price = useMemo(() => getPrice(product), [product]);

  const originalPrice = useMemo(() => getOriginalPrice(product), [product]);

  const stock = useMemo(() => getStock(product), [product]);

  const averageRating = useMemo(() => {
    if (
      product?.rating !== undefined &&
      product?.rating !== null &&
      product?.rating !== ""
    ) {
      return Number(product.rating) || 0;
    }

    if (!reviews.length) return 0;

    return (
      reviews.reduce((sum, review) => sum + (Number(review?.rating) || 0), 0) /
      reviews.length
    );
  }, [product, reviews]);

  const discountPercentage = useMemo(() => {
    if (originalPrice <= price || originalPrice <= 0) return 0;

    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }, [originalPrice, price]);

  const productId = getId(product);

  const isWishlisted = wishlist.some(
    (item) =>
      String(typeof item === "object" ? getId(item) : item) === productId,
  );

  /* Wishlist */

  const handleWishlist = useCallback(() => {
    if (!productId) return;

    const exists = wishlist.some(
      (item) =>
        String(typeof item === "object" ? getId(item) : item) === productId,
    );

    const updated = exists
      ? wishlist.filter(
          (item) =>
            String(typeof item === "object" ? getId(item) : item) !== productId,
        )
      : [...wishlist, productId];

    localStorage.setItem("wishlist", JSON.stringify(updated));
    setWishlist(updated);

    toast.success(exists ? "Removed from wishlist" : "Added to wishlist");
  }, [productId, wishlist]);

  /* Add to cart */

  const handleAddToCart = useCallback(async () => {
    if (!productId) {
      toast.error("Product information is unavailable.");
      return;
    }

    if (!getToken()) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    if (stock <= 0) {
      toast.error("This product is out of stock.");
      return;
    }

    if (quantity > stock) {
      toast.error(`Only ${stock} item(s) are available.`);
      return;
    }

    try {
      setAddingToCart(true);

      // Pass the product ID and quantity as separate arguments.
      await cartService.addToCart(productId, quantity);

      toast.success("Product added to cart");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setAddingToCart(false);
    }
  }, [productId, quantity, stock]);

  /* Quantity controls */

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(stock, current + 1));
  };

  /* Loading screen */

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="mb-8 h-5 w-32 rounded bg-gray-200" />

          <div className="grid gap-10 md:grid-cols-2">
            <div className="aspect-square rounded-2xl bg-gray-200" />

            <div className="space-y-5 py-4">
              <div className="h-8 w-3/4 rounded bg-gray-200" />
              <div className="h-5 w-1/3 rounded bg-gray-200" />
              <div className="h-10 w-1/2 rounded bg-gray-200" />
              <div className="h-24 rounded bg-gray-200" />
              <div className="h-12 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* Error screen */

  if (pageError || !product) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Package size={48} className="mx-auto text-gray-400" />

        <h1 className="mt-5 text-2xl font-semibold text-gray-900">
          Unable to load product
        </h1>

        <p className="mt-3 text-gray-600">
          {pageError || "This product could not be found."}
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
          >
            <RefreshCw size={17} />
            Try again
          </button>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-800 hover:bg-gray-50"
          >
            <ArrowLeft size={17} />
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  /* Main page */

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/products"
        className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={17} />
        Back to products
      </Link>

      <section className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Images */}

        <div>
          <div className="relative overflow-hidden rounded-2xl">
            <ProductImage
              key={images[selectedImage] || "no-image"}
              src={images[selectedImage]}
              alt={product.name || "Furniture product"}
              className="aspect-square w-full"
            />

            {discountPercentage > 0 && (
              <span className="absolute left-4 top-4 rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white">
                {discountPercentage}% OFF
              </span>
            )}

            <button
              type="button"
              onClick={handleWishlist}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow"
            >
              <Heart
                size={21}
                className={
                  isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"
                }
              />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() =>
                    setSelectedImage((current) =>
                      current === 0 ? images.length - 1 : current - 1,
                    )
                  }
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
                >
                  <ChevronLeft size={22} />
                </button>

                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() =>
                    setSelectedImage((current) => (current + 1) % images.length)
                  }
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-6">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`overflow-hidden rounded-lg border-2 ${
                    selectedImage === index
                      ? "border-gray-900"
                      : "border-transparent"
                  }`}
                >
                  <ProductImage
                    src={image}
                    alt={`${product.name || "Product"} ${index + 1}`}
                    className="aspect-square w-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product details */}

        <div>
          {product.category && (
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">
              {typeof product.category === "object"
                ? product.category.name
                : product.category}
            </p>
          )}

          <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4">
            <RatingStars rating={averageRating} count={reviews.length} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(price)}
            </span>

            {originalPrice > price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(originalPrice)}
                </span>

                <span className="rounded-md bg-green-100 px-2.5 py-1 text-sm font-medium text-green-700">
                  Save {formatPrice(originalPrice - price)}
                </span>
              </>
            )}
          </div>

          <div className="mt-6 border-y border-gray-200 py-5">
            <div className="flex items-center gap-2">
              {stock > 0 ? (
                <>
                  <Check size={18} className="text-green-600" />
                  <span className="font-medium text-green-700">In stock</span>

                  {stock <= 5 && (
                    <span className="text-sm text-gray-500">
                      — Only {stock} left
                    </span>
                  )}
                </>
              ) : (
                <span className="font-medium text-red-600">Out of stock</span>
              )}
            </div>

            {product.description && (
              <p className="mt-5 whitespace-pre-line text-base leading-7 text-gray-600">
                {product.description}
              </p>
            )}
          </div>

          {/* Quantity */}

          <div className="mt-6">
            <label className="mb-3 block text-sm font-medium text-gray-800">
              Quantity
            </label>

            <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-300">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="flex h-11 w-11 items-center justify-center hover:bg-gray-100 disabled:opacity-40"
              >
                <Minus size={16} />
              </button>

              <span className="flex h-11 min-w-12 items-center justify-center border-x border-gray-300 px-3 font-medium">
                {quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={stock <= 0 || quantity >= stock}
                aria-label="Increase quantity"
                className="flex h-11 w-11 items-center justify-center hover:bg-gray-100 disabled:opacity-40"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Cart buttons */}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stock <= 0 || addingToCart}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <ShoppingCart size={19} />
              {addingToCart
                ? "Adding to cart..."
                : stock <= 0
                  ? "Out of stock"
                  : "Add to cart"}
            </button>

            <button
              type="button"
              onClick={handleWishlist}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-800 hover:bg-gray-50"
            >
              <Heart
                size={19}
                className={isWishlisted ? "fill-red-500 text-red-500" : ""}
              />
              {isWishlisted ? "Wishlisted" : "Wishlist"}
            </button>
          </div>

          {/* Delivery information */}

          <div className="mt-8 grid gap-4 rounded-xl bg-gray-50 p-5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Truck size={22} className="mt-0.5 shrink-0 text-gray-700" />
              <div>
                <h3 className="font-medium text-gray-900">Delivery</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Delivery options depend on your location.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck
                size={22}
                className="mt-0.5 shrink-0 text-gray-700"
              />
              <div>
                <h3 className="font-medium text-gray-900">Secure shopping</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Shop with confidence.
                </p>
              </div>
            </div>
          </div>

          <Specifications product={product} />
        </div>
      </section>

      {/* Reviews */}

      <section className="mt-16 border-t border-gray-200 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Customer reviews
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {reviews.length} review{reviews.length === 1 ? "" : "s"} for this
              product
            </p>
          </div>

          {reviews.length > 0 && (
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-2xl font-bold text-gray-900">
                {averageRating.toFixed(1)} / 5
              </p>
              <RatingStars rating={averageRating} />
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-5 py-10 text-center">
            <Star size={32} className="mx-auto text-gray-300" />
            <h3 className="mt-3 font-medium text-gray-800">No reviews yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to review this product.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            {reviews.map((review, index) => (
              <ReviewCard key={getId(review) || index} review={review} />
            ))}
          </div>
        )}
      </section>

      {/* Review form */}

      <section className="mt-8">
        <ReviewForm productId={productId} onReviewSubmitted={handleRetry} />
      </section>

      {/* Related products */}

      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-gray-200 pt-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              You may also like
            </h2>

            <Link
              to="/products"
              className="text-sm font-medium text-gray-700 hover:text-black"
            >
              View all products
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((item, index) => (
              <RelatedProductCard key={getId(item) || index} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
