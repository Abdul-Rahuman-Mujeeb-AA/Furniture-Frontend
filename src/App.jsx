import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import NotFound from "./pages/NotFound";

// User pages
import UserDashboard from "./pages/UserDashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import ManageProducts from "./pages/ManageProducts";
import ProductForm from "./pages/ProductForm";
import ManageCategories from "./pages/ManageCategories";
import CategoryForm from "./pages/CategoryForm";
import ManageOrders from "./pages/ManageOrders";

// Layouts
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/AdminLayout";

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("accessToken");
}

function ProtectedRoute({ children, allowedRoles }) {
  const token = getToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin" : "/user/dashboard"}
        replace
      />
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

        {/* Public product routes */}
        <Route path="/products" element={<Products />} />

        <Route path="/products/:id" element={<ProductDetails />} />

        {/* User protected routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/user/dashboard" element={<UserDashboard />} />

          <Route path="/categories" element={<Categories />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/checkout" element={<Checkout />} />

          <Route path="/my-orders" element={<MyOrders />} />

          <Route path="/orders/:id" element={<OrderDetails />} />

          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin protected routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/admin/products" element={<ManageProducts />} />

          <Route path="/admin/products/new" element={<ProductForm />} />

          {/* Edit URL must match ManageProducts.jsx */}
          <Route path="/admin/products/edit/:id" element={<ProductForm />} />

          {/* Optional compatibility route for old links */}
          <Route path="/admin/products/:id/edit" element={<ProductForm />} />

          <Route path="/admin/categories" element={<ManageCategories />} />

          <Route path="/admin/categories/new" element={<CategoryForm />} />

          <Route path="/admin/categories/edit/:id" element={<CategoryForm />} />

          <Route path="/admin/orders" element={<ManageOrders />} />
        </Route>

        {/* Not found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;