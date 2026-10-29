import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "");

const reviewApi = axios.create({
  baseURL: `${API_BASE_URL}/reviews`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach authentication token to protected requests.
reviewApi.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

const reviewService = {
  // GET /api/reviews/product/:productId
  async getProductReviews(productId) {
    if (!productId) {
      throw new Error("Product ID is required.");
    }

    const response = await reviewApi.get(
      `/product/${encodeURIComponent(productId)}`,
    );

    const data = response.data;

    // Your backend returns { totalReviews, averageRating, reviews }.
    if (Array.isArray(data?.reviews)) return data.reviews;
    if (Array.isArray(data?.data?.reviews)) return data.data.reviews;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;

    return [];
  },

  // POST /api/reviews
  // Backend expects { productId, rating, comment }.
  async createReview(productId, reviewData = {}) {
    if (!productId) {
      throw new Error("Product ID is required to submit a review.");
    }

    const rating = Number(reviewData.rating);
    const comment = String(reviewData.comment || "").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error("Please select a rating from 1 to 5 stars.");
    }

    if (!comment) {
      throw new Error("Please write your review.");
    }

    const response = await reviewApi.post("/", {
      productId,
      rating,
      comment,
    });

    return response.data;
  },

  // PUT /api/reviews/:id
  async updateReview(reviewId, reviewData = {}) {
    if (!reviewId) {
      throw new Error("Review ID is required.");
    }

    const response = await reviewApi.put(
      `/${encodeURIComponent(reviewId)}`,
      reviewData,
    );

    return response.data;
  },

  // DELETE /api/reviews/:id
  async deleteReview(reviewId) {
    if (!reviewId) {
      throw new Error("Review ID is required.");
    }

    const response = await reviewApi.delete(`/${encodeURIComponent(reviewId)}`);

    return response.data;
  },

  // Compatibility alias for other components.
  async submitReview(productId, reviewData = {}) {
    return reviewService.createReview(productId, reviewData);
  },
};

export default reviewService;
