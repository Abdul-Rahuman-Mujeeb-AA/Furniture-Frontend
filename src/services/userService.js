import api from "./api";

const userService = {
  updateProfile: async (userData) => {
    const response = await api.put("/users/profile", userData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put(
      "/users/change-password",
      passwordData
    );

    return response.data;
  },
};

export default userService;