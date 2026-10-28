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

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.reviews)) return data.reviews;
    if (Array.isArray(data?.data)) return data.data;

    return [];
  },

  // POST /api/reviews
  async createReview(reviewData) {
    if (!reviewData?.productId) {
      throw new Error("Product ID is required to submit a review.");
    }

    if (!reviewData?.rating) {
      throw new Error("Please provide a rating.");
    }

    const response = await reviewApi.post("/", reviewData);
    return response.data;
  },

  // PUT /api/reviews/:id
  async updateReview(reviewId, reviewData) {
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

  // Alias for components using submitReview().
  async submitReview(reviewData) {
    return this.createReview(reviewData);
  },
};

export default reviewService;
