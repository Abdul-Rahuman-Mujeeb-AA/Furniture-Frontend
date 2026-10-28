import {
  FiStar,
  FiUser,
  FiCalendar,
  FiThumbsUp,
  FiAward,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
} from "react-icons/fi";

function ReviewCard({
  review = {},
  currentUserId = "",
  onHelpful,
  onEdit,
  onDelete,
  helpful = false,
  helpfulLoading = false,
  deleting = false,
  showActions = true,
}) {
  const reviewerName =
    review.user?.name || review.userName || review.name || "Customer";

  const rating = Math.min(
    5,
    Math.max(0, Math.round(Number(review.rating) || 0)),
  );

  const reviewText =
    review.comment ||
    review.review ||
    review.text ||
    "No written comment provided.";

  const reviewId = review._id || review.id;

  const reviewerId =
    typeof review.user === "object"
      ? review.user?._id || review.user?.id
      : review.user;

  const isOwnReview =
    currentUserId && reviewerId && String(currentUserId) === String(reviewerId);

  const formatDate = (date) => {
    if (!date) return "Recently";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Recently";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();

  return (
    <article className="group w-full rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition duration-300 hover:border-emerald-200 hover:shadow-md sm:p-5 lg:p-6">
      {/* Reviewer information */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-100 to-amber-50 text-sm font-bold text-emerald-900 ring-1 ring-emerald-100 sm:h-12 sm:w-12">
          {getInitials(reviewerName) || <FiUser />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="wrap-break-words text-sm font-bold text-stone-900 sm:text-base">
                  {reviewerName}
                </h3>

                {review.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800 sm:text-xs">
                    <FiCheckCircle />
                    Verified buyer
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div
                  className="flex items-center gap-0.5"
                  aria-label={`${rating} out of 5 stars`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={`text-sm ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-stone-300"
                      }`}
                    />
                  ))}
                </div>

                <span className="text-xs font-semibold text-stone-600">
                  {rating}.0 / 5
                </span>
              </div>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-stone-400">
              <FiCalendar />
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Review content */}
      <div className="mt-5 sm:mt-6">
        {review.title && (
          <h4 className="text-base font-bold leading-6 text-stone-900 sm:text-lg">
            {review.title}
          </h4>
        )}

        <p className="mt-2 whitespace-pre-line wrap-break-words text-sm leading-7 text-stone-600">
          {reviewText}
        </p>

        {review.updatedAt &&
          review.createdAt &&
          new Date(review.updatedAt).getTime() >
            new Date(review.createdAt).getTime() + 60000 && (
            <p className="mt-2 text-xs italic text-stone-400">
              Edited {formatDate(review.updatedAt)}
            </p>
          )}
      </div>

      {/* Optional product or purchase highlight */}
      {review.verifiedPurchase && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50/70 p-3 text-xs leading-5 text-emerald-900 sm:text-sm">
          <FiAward className="mt-0.5 shrink-0 text-base" />
          <span>This review is marked as a verified purchase.</span>
        </div>
      )}

      {/* Review actions */}
      {showActions && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
          <button
            type="button"
            onClick={() => onHelpful?.(reviewId)}
            disabled={
              !onHelpful ||
              !reviewId ||
              helpful ||
              helpfulLoading ||
              Boolean(isOwnReview)
            }
            aria-pressed={helpful}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
              helpful
                ? "bg-emerald-50 text-emerald-800"
                : "text-stone-500 hover:bg-stone-50 hover:text-emerald-800"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <FiThumbsUp />
            {helpfulLoading
              ? "Updating..."
              : helpful
                ? "Marked helpful"
                : "Helpful"}

            {Number(review.helpfulCount) > 0 && ` (${review.helpfulCount})`}
          </button>

          {isOwnReview && (
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(review)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 sm:text-sm"
                >
                  <FiEdit2 />
                  Edit
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(review)}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                >
                  <FiTrash2 />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default ReviewCard;