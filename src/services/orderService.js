import api from "./api";

const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get("/orders/my-orders");
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },

  getAllOrders: async (params = {}) => {
    const response = await api.get("/orders/admin/all", { params });
    return response.data;
  },

  updateOrderStatus: async (id, statusData) => {
    const response = await api.put(
      `/orders/admin/${id}/status`,
      statusData
    );

    return response.data;
  },
};

export default orderService;