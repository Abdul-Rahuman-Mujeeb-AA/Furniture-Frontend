import { useMemo, useState } from "react";
import {
  FiStar,
  FiMessageSquare,
  FiThumbsUp,
  FiCalendar,
  FiChevronDown,
  FiRefreshCw,
  FiMessageCircle,
  FiUser,
  FiAward,
} from "react-icons/fi";

const STAR_VALUES = [5, 4, 3, 2, 1];

function ReviewList({
  reviews = [],
  loading = false,
  error = "",
  onRetry,
  onHelpful,
  currentUserId = "",
  title = "Customer Reviews",
  subtitle = "Honest thoughts from people who made this piece part of their home.",
}) {
  const [sortBy, setSortBy] = useState("newest");
  const [helpfulReviews, setHelpfulReviews] = useState([]);

  const reviewStats = useMemo(() => {
    const total = reviews.length;

    const average =
      total > 0
        ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
          total
        : 0;

    const distribution = STAR_VALUES.map((star) => {
      const count = reviews.filter(
        (review) => Number(review.rating) === star,
      ).length;

      return {
        star,
        count,
        percentage: total ? (count / total) * 100 : 0,
      };
    });

    return { total, average, distribution };
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    const items = [...reviews];

    switch (sortBy) {
      case "highest":
        return items.sort(
          (a, b) => Number(b.rating || 0) - Number(a.rating || 0),
        );

      case "lowest":
        return items.sort(
          (a, b) => Number(a.rating || 0) - Number(b.rating || 0),
        );

      case "oldest":
        return items.sort(
          (a, b) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime(),
        );

      case "newest":
      default:
        return items.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );
    }
  }, [reviews, sortBy]);

  const handleHelpful = (review) => {
    const reviewId = review._id || review.id;

    if (!reviewId || helpfulReviews.includes(reviewId)) return;

    setHelpfulReviews((previous) => [...previous, reviewId]);

    if (onHelpful) {
      onHelpful(reviewId);
    }
  };

  const renderStars = (rating, size = "text-sm") => {
    const value = Math.round(Number(rating) || 0);

    return (
      <div
        className={`flex items-center gap-0.5 ${size}`}
        aria-label={`${value} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={
              star <= value ? "fill-amber-400 text-amber-400" : "text-stone-300"
            }
          />
        ))}
      </div>
    );
  };

  const getReviewerName = (review) =>
    review.user?.name || review.userName || review.name || "Customer";

  const getInitials = (name) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

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

  const getReviewId = (review) => review._id || review.id;

  return (
    <section className="w-full py-8 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <FiMessageCircle />
              Real experiences
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
              {title}
              {reviewStats.total > 0 && (
                <span className="ml-2 text-lg font-medium text-stone-400 sm:text-2xl">
                  ({reviewStats.total})
                </span>
              )}
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-500 sm:text-base">
              {subtitle}
            </p>
          </div>

          {reviews.length > 0 && (
            <label className="flex w-full items-center gap-3 self-start rounded-xl border border-stone-200 bg-white px-3 py-2.5 sm:w-auto sm:self-auto">
              <span className="shrink-0 text-xs font-semibold text-stone-500">
                Sort by
              </span>

              <span className="relative flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="w-full cursor-pointer appearance-none bg-transparent pr-7 text-sm font-semibold text-stone-800 outline-none sm:min-w-32"
                  aria-label="Sort reviews"
                >
                  <option value="newest">Most recent</option>
                  <option value="oldest">Oldest first</option>
                  <option value="highest">Highest rated</option>
                  <option value="lowest">Lowest rated</option>
                </select>
                <FiChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-stone-500" />
              </span>
            </label>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="animate-pulse rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
              <div className="h-5 w-36 rounded bg-stone-200" />
              <div className="mt-6 h-12 w-24 rounded bg-stone-200" />
              <div className="mt-4 h-4 w-40 rounded bg-stone-100" />
              <div className="mt-8 space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="h-3 rounded bg-stone-100" />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"
                >
                  <div className="flex gap-3">
                    <div className="h-11 w-11 rounded-full bg-stone-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-stone-200" />
                      <div className="h-3 w-24 rounded bg-stone-100" />
                    </div>
                  </div>
                  <div className="mt-5 h-4 w-2/3 rounded bg-stone-200" />
                  <div className="mt-3 h-3 w-full rounded bg-stone-100" />
                  <div className="mt-2 h-3 w-4/5 rounded bg-stone-100" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-100 bg-red-50 px-5 py-10 text-center sm:px-8"
          >
            <FiMessageSquare className="mx-auto text-3xl text-red-400" />
            <h3 className="mt-4 text-lg font-bold text-stone-900">
              Reviews couldn't be loaded
            </h3>
            <p className="mt-2 text-sm text-stone-600">{error}</p>

            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                <FiRefreshCw />
                Try again
              </button>
            )}
          </div>
        )}

        {/* Review content */}
        {!loading && !error && reviews.length > 0 && (
          <div className="grid items-start gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-7">
            {/* Rating overview */}
            <aside className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="bg-[#183f35] p-6 text-white sm:p-8">
                <p className="text-sm font-medium text-emerald-100">
                  Overall customer rating
                </p>

                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <span className="text-5xl font-bold tracking-tight sm:text-6xl">
                    {reviewStats.average.toFixed(1)}
                  </span>
                  <div className="pb-1">
                    {renderStars(reviewStats.average, "text-base")}
                    <p className="mt-1.5 text-xs text-emerald-100">
                      Based on {reviewStats.total}{" "}
                      {reviewStats.total === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs text-emerald-100">
                  <FiAward className="text-lg" />
                  Ratings from our customer community
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <h3 className="mb-5 text-sm font-bold text-stone-900">
                  Rating breakdown
                </h3>

                <div className="space-y-3.5">
                  {reviewStats.distribution.map((item) => (
                    <div key={item.star} className="flex items-center gap-3">
                      <span className="flex w-8 shrink-0 items-center gap-1 text-sm font-medium text-stone-600">
                        {item.star}
                        <FiStar className="fill-amber-400 text-amber-400" />
                      </span>

                      <div
                        className="h-2.5 flex-1 overflow-hidden rounded-full bg-stone-100"
                        role="progressbar"
                        aria-label={`${item.star} star reviews`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(item.percentage)}
                      >
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>

                      <span className="w-7 text-right text-xs tabular-nums text-stone-500">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Individual reviews */}
            <div className="space-y-4">
              {sortedReviews.map((review, index) => {
                const reviewId = getReviewId(review);
                const reviewerName = getReviewerName(review);
                const isHelpful = helpfulReviews.includes(reviewId);
                const reviewUserId =
                  typeof review.user === "object"
                    ? review.user?._id || review.user?.id
                    : review.user;
                const isOwnReview =
                  currentUserId &&
                  reviewUserId &&
                  String(currentUserId) === String(reviewUserId);

                return (
                  <article
                    key={reviewId || `${review.createdAt || "review"}-${index}`}
                    className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
                        {getInitials(reviewerName) || <FiUser />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="wrap-break-words text-sm font-bold text-stone-900 sm:text-base">
                              {reviewerName}
                            </h3>

                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              {renderStars(review.rating)}

                              <span className="text-xs text-stone-400">
                                {Number(review.rating) || 0}/5
                              </span>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1.5 text-xs text-stone-400 sm:pt-1">
                            <FiCalendar />
                            {formatDate(review.createdAt)}
                          </span>
                        </div>

                        {review.title && (
                          <h4 className="mt-4 text-sm font-bold leading-6 text-stone-800 sm:text-base">
                            {review.title}
                          </h4>
                        )}

                        <p className="mt-2 whitespace-pre-line wrap-break-words text-sm leading-7 text-stone-600">
                          {review.comment ||
                            review.review ||
                            review.text ||
                            "No written comment provided."}
                        </p>

                        {review.updatedAt &&
                          review.createdAt &&
                          new Date(review.updatedAt).getTime() >
                            new Date(review.createdAt).getTime() + 60000 && (
                            <p className="mt-2 text-xs italic text-stone-400">
                              Edited {formatDate(review.updatedAt)}
                            </p>
                          )}

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                          <button
                            type="button"
                            disabled={
                              !onHelpful ||
                              isHelpful ||
                              !reviewId ||
                              Boolean(isOwnReview)
                            }
                            onClick={() => handleHelpful(review)}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                              isHelpful
                                ? "bg-emerald-50 text-emerald-800"
                                : "text-stone-500 hover:bg-stone-50 hover:text-emerald-800"
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                            aria-pressed={isHelpful}
                          >
                            <FiThumbsUp />
                            {isHelpful ? "Marked helpful" : "Helpful"}
                            {Number(review.helpfulCount) > 0 &&
                              ` (${review.helpfulCount})`}
                          </button>

                          {review.verifiedPurchase && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800">
                              <FiAward />
                              Verified purchase
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && reviews.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-12 text-center sm:px-8 sm:py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
              <FiMessageSquare className="text-2xl" />
            </div>

            <h3 className="mt-5 text-xl font-bold text-stone-900">
              Be the first to share your experience
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
              There are no reviews for this product yet. Your feedback can help
              others choose furniture for their home.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ReviewList;