import { useCallback, useEffect, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiZoomIn,
  FiImage,
} from "react-icons/fi";

function ProductImages({
  images = [],
  productName = "Furniture product",
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Support backend image objects and plain image URLs.
  const imageList = images
    .map((image) =>
      typeof image === "string" ? image : image?.url || ""
    )
    .filter(Boolean);

  // Keep the selected index valid if the images change.
  const safeIndex =
    imageList.length > 0
      ? Math.min(activeIndex, imageList.length - 1)
      : 0;

  const activeImage = imageList[safeIndex];

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => {
      if (imageList.length === 0) return 0;
      return current <= 0 ? imageList.length - 1 : current - 1;
    });
  }, [imageList.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => {
      if (imageList.length === 0) return 0;
      return current >= imageList.length - 1 ? 0 : current + 1;
    });
  }, [imageList.length]);

  const closeViewer = useCallback(() => {
    setIsViewerOpen(false);
  }, []);

  // Keyboard navigation and body scroll locking for the viewer.
  useEffect(() => {
    if (!isViewerOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isViewerOpen, closeViewer, showPrevious, showNext]);

  if (imageList.length === 0) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center rounded-3xl border border-stone-200 bg-stone-100 text-stone-400 sm:aspect-5/4 lg:aspect-square">
        <FiImage size={48} strokeWidth={1.2} />
        <p className="mt-4 text-sm font-medium">
          No product images available
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      {/* Main image */}
      <div className="group relative overflow-hidden rounded-2xl border border-stone-200/70 bg-[#f3f0e9] sm:rounded-3xl">
        <div className="aspect-square w-full sm:aspect-5/4 lg:aspect-square">
          <img
            key={activeImage}
            src={activeImage}
            alt={`${productName} — image ${safeIndex + 1}`}
            onClick={() => setIsViewerOpen(true)}
            className="h-full w-full cursor-zoom-in object-contain p-3 transition duration-500 group-hover:scale-[1.02] sm:p-5 lg:p-7"
          />
        </div>

        {/* Image counter */}
        <div className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur sm:left-5 sm:top-5">
          {String(safeIndex + 1).padStart(2, "0")} /{" "}
          {String(imageList.length).padStart(2, "0")}
        </div>

        {/* Zoom button */}
        <button
          type="button"
          onClick={() => setIsViewerOpen(true)}
          aria-label="View image full screen"
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-stone-700 shadow-sm transition hover:bg-emerald-800 hover:text-white sm:bottom-5 sm:right-5"
        >
          <FiZoomIn size={18} />
        </button>

        {/* Main image navigation */}
        {imageList.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous product image"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/90 text-stone-700 shadow-sm transition hover:bg-emerald-800 hover:text-white sm:left-4 sm:h-11 sm:w-11"
            >
              <FiChevronLeft size={21} />
            </button>

            <button
              type="button"
              onClick={showNext}
              aria-label="Next product image"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/90 text-stone-700 shadow-sm transition hover:bg-emerald-800 hover:text-white sm:right-4 sm:h-11 sm:w-11"
            >
              <FiChevronRight size={21} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail gallery */}
      {imageList.length > 1 && (
        <div className="mt-3 sm:mt-4">
          <div className="flex gap-2.5 overflow-x-auto pb-2 sm:gap-3">
            {imageList.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1}`}
                aria-pressed={safeIndex === index}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-[#f3f0e9] transition sm:h-20 sm:w-20 md:h-24 md:w-24 ${
                  safeIndex === index
                    ? "border-emerald-700 ring-2 ring-emerald-700/15"
                    : "border-transparent hover:border-stone-300"
                }`}
              >
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  loading="lazy"
                  className="h-full w-full object-contain p-1.5"
                />

                {safeIndex === index && (
                  <span className="absolute inset-x-2 bottom-0.5 h-0.5 rounded-full bg-emerald-700" />
                )}
              </button>
            ))}
          </div>

          <p className="mt-1 text-xs text-stone-500">
            Select a thumbnail to explore different angles.
          </p>
        </div>
      )}

      {/* Full-screen image viewer */}
      {isViewerOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-stone-950/95 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} image viewer`}
          onClick={closeViewer}
        >
          <button
            type="button"
            onClick={closeViewer}
            aria-label="Close image viewer"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
          >
            <FiX size={23} />
          </button>

          <div className="absolute left-4 top-5 text-sm font-medium text-white/80 sm:left-6 sm:top-7">
            {safeIndex + 1} of {imageList.length}
          </div>

          <div
            className="relative flex h-full max-h-[85vh] w-full max-w-6xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={`${productName} — enlarged view`}
              className="max-h-full max-w-full object-contain"
            />

            {imageList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  aria-label="Previous image"
                  className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-3 sm:h-12 sm:w-12"
                >
                  <FiChevronLeft size={26} />
                </button>

                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next image"
                  className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-3 sm:h-12 sm:w-12"
                >
                  <FiChevronRight size={26} />
                </button>
              </>
            )}
          </div>

          <p className="absolute bottom-4 max-w-[80%] truncate text-center text-sm text-white/70 sm:bottom-6">
            {productName}
          </p>
        </div>
      )}
    </div>
  );
}

export default ProductImages;
