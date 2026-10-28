import { useState } from "react";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import reviewService from "../services/reviewService";

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !localStorage.getItem("token") &&
      !localStorage.getItem("accessToken")
    ) {
      toast.error("Please log in to submit a review.");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Please select a star rating.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write your review.");
      return;
    }

    try {
      setSubmitting(true);

      await reviewService.createReview(productId, {
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      toast.success("Review submitted successfully.");

      setRating(0);
      setTitle("");
      setComment("");

      if (onReviewSubmitted) {
        await onReviewSubmitted();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to submit review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-xl font-semibold text-gray-900">Write a Review</h3>

      <p className="mt-1 text-sm text-gray-500">
        Share your experience with this product.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-800">
            Your Rating
          </label>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Rate ${value} out of 5 stars`}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
                className="rounded p-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <Star
                  size={28}
                  className={
                    value <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}

            <span className="ml-2 text-sm text-gray-600">
              {rating ? `${rating}/5` : "Select rating"}
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="review-title"
            className="mb-2 block text-sm font-medium text-gray-800"
          >
            Review Title
          </label>

          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Summarize your experience"
            maxLength={100}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>

        <div>
          <label
            htmlFor="review-comment"
            className="mb-2 block text-sm font-medium text-gray-800"
          >
            Your Review
          </label>

          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What did you like or dislike about this product?"
            rows={5}
            maxLength={2000}
            required
            className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />

          <p className="mt-1 text-right text-xs text-gray-500">
            {comment.length}/2000 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
