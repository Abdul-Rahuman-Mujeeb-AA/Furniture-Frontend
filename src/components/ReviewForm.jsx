import { useState } from "react";
import {
  FiStar,
  FiMessageSquare,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

function ReviewForm({
  productId,
  onSubmit,
  submitting = false,
  error = "",
  initialValues = {},
}) {
  const [rating, setRating] = useState(initialValues.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(initialValues.title || "");
  const [comment, setComment] = useState(initialValues.comment || "");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isEditing = Boolean(initialValues._id || initialValues.id);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    if (!productId) {
      setValidationError("Product information is missing.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setValidationError("Please select a star rating.");
      return;
    }

    if (!title.trim()) {
      setValidationError("Please enter a title for your review.");
      return;
    }

    if (!comment.trim()) {
      setValidationError("Please share your experience with this product.");
      return;
    }

    if (title.trim().length > 100) {
      setValidationError("The review title must be 100 characters or fewer.");
      return;
    }

    if (comment.trim().length > 1000) {
      setValidationError("Your review must be 1,000 characters or fewer.");
      return;
    }

    if (typeof onSubmit !== "function") {
      setValidationError("Review submission is not configured.");
      return;
    }

    try {
      const result = await onSubmit({
        product: productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      if (result === false) return;

      setSuccessMessage(
        isEditing
          ? "Your review has been updated."
          : "Your review has been submitted.",
      );

      if (!isEditing) {
        setRating(0);
        setTitle("");
        setComment("");
      }
    } catch {
      setValidationError("Unable to submit your review. Please try again.");
    }
  };

  const displayedRating = hoverRating || rating;

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm sm:rounded-3xl">
      {/* Header */}
      <div className="relative overflow-hidden bg-emerald-950 px-5 py-6 text-white sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute -right-6 -top-10 h-36 w-36 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute right-5 top-8 h-20 w-20 rounded-full border border-white/10" />

        <div className="relative flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 sm:h-12 sm:w-12">
            <FiMessageSquare size={22} />
          </div>

          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200 sm:text-xs">
              Your experience matters
            </p>

            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              {isEditing ? "Edit your review" : "Write a review"}
            </h2>

            <p className="mt-1.5 max-w-md text-sm leading-6 text-emerald-100/75">
              Share your thoughts and help others find furniture they'll love.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-7">
        {/* Star rating */}
        <fieldset>
          <legend className="text-sm font-bold text-stone-900">
            How would you rate this product?
          </legend>

          <p className="mt-1 text-xs text-stone-500">
            Select one to five stars.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={submitting}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onFocus={() => setHoverRating(star)}
                onBlur={() => setHoverRating(0)}
                aria-label={`${star} out of 5 stars`}
                aria-pressed={rating === star}
                className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:w-12"
              >
                <FiStar
                  size={26}
                  className={`transition-colors sm:h-7 sm:w-7 ${
                    star <= displayedRating
                      ? "fill-amber-400 text-amber-500"
                      : "text-stone-300"
                  }`}
                />
              </button>
            ))}

            <span
              aria-live="polite"
              className="ml-1 text-sm font-semibold text-stone-600 sm:ml-3"
            >
              {displayedRating ? RATING_LABELS[displayedRating] : "Not rated"}
            </span>
          </div>
        </fieldset>

        {/* Review title */}
        <div>
          <label
            htmlFor="review-title"
            className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-stone-800"
          >
            <span>Review title</span>
            <span className="text-xs font-normal text-stone-400">
              {title.length}/100
            </span>
          </label>

          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
            placeholder="e.g. Beautiful design and great quality"
            disabled={submitting}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 disabled:opacity-60"
          />
        </div>

        {/* Review comment */}
        <div>
          <label
            htmlFor="review-comment"
            className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-stone-800"
          >
            <span>Tell us about your experience</span>
            <span className="shrink-0 text-xs font-normal text-stone-400">
              {comment.length}/1000
            </span>
          </label>

          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={1000}
            rows={5}
            placeholder="How does it look in your space? Tell us about the comfort, materials, quality, or assembly..."
            disabled={submitting}
            className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm leading-6 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 disabled:opacity-60 sm:rows-6"
          />
        </div>

        {/* Error message */}
        {(validationError || error) && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700"
          >
            <FiAlertCircle className="mt-0.5 shrink-0" size={17} />
            <p>{validationError || error}</p>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-sm text-emerald-800"
          >
            <FiCheckCircle className="mt-0.5 shrink-0" size={17} />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Submit */}
        <div className="border-t border-stone-100 pt-5">
          <button
            type="submit"
            disabled={submitting}
            className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-800 px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-48"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Submitting review...
              </>
            ) : (
              <>
                <FiSend size={17} />
                {isEditing ? "Update review" : "Submit review"}
              </>
            )}
          </button>

          <p className="mt-3 text-xs leading-5 text-stone-500">
            Please keep your review helpful, honest, and respectful.
          </p>
        </div>
      </form>
    </section>
  );
}

export default ReviewForm;