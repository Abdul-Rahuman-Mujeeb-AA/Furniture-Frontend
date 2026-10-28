import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.VITE_API_URL;

const adminNavigation = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    label: "Categories",
    path: "/admin/categories",
    icon: FolderTree,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ClipboardList,
  },
];

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken");

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const extractUser = (response) => {
  const data = response?.data;

  return data?.user || data?.data?.user || data?.data || data;
};

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();

  const [admin, setAdmin] = useState(getStoredUser);
  const [loading, setLoading] = useState(Boolean(token));
  const [verified, setVerified] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    if (!token) return;

    let active = true;

    const verifyAdmin = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 20000,
        });

        if (!active) return;

        const profile = extractUser(response);

        if (!profile?.role) {
          throw new Error("Invalid admin profile.");
        }

        setAdmin(profile);
        setVerified(true);
        localStorage.setItem("user", JSON.stringify(profile));
      } catch {
        if (!active) return;

        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        setVerified(false);
        toast.error("Admin session verification failed.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void verifyAdmin();

    return () => {
      active = false;
    };
  }, [token]);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    closeMenus();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f3]">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#dce7da] border-t-[#294637]" />
          <p className="mt-5 text-sm text-[#728473]">
            Verifying administrator access...
          </p>
        </div>
      </div>
    );
  }

  if (!verified || !admin) {
    return <Navigate to="/login" replace />;
  }

  if (admin.role !== "admin") {
    return <Navigate to="/user/dashboard" replace />;
  }

  const displayName = admin.name || "Administrator";

  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7f3] text-[#263c30]">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#e5ebe2] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-19 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/admin"
            onClick={closeMenus}
            className="flex shrink-0 items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#294637] text-white">
              <ShoppingBag size={23} strokeWidth={1.7} />
            </span>

            <span>
              <span className="block text-xl font-bold tracking-tight text-[#294637]">
                Furnispace
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b9c8d]">
                Admin workspace
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Admin navigation"
            className="hidden items-center gap-1 lg:flex"
          >
            {adminNavigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#eaf1e7] text-[#294637]"
                      : "text-[#748575] hover:bg-[#f0f4ee] hover:text-[#294637]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/admin/products/new"
              className="hidden items-center gap-2 rounded-full bg-[#294637] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e3528] md:inline-flex"
            >
              <Plus size={17} />
              Add Product
            </Link>

            {/* Account Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen((value) => !value);
                  setMobileMenuOpen(false);
                }}
                aria-label="Admin account menu"
                aria-expanded={accountMenuOpen}
                className="flex items-center gap-2 rounded-full border border-[#e5ebe2] bg-white p-1 pr-2 transition hover:bg-[#f7faf5] sm:pr-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#294637] text-xs font-bold text-white">
                  {initials || "A"}
                </span>

                <span className="hidden max-w-28 truncate text-sm font-semibold text-[#344c39] sm:block">
                  {displayName}
                </span>

                <ChevronDown
                  size={15}
                  className={`text-[#7b8e7d] transition ${
                    accountMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-[#e7ece4] bg-white p-2 shadow-xl shadow-[#263c30]/10">
                  <div className="border-b border-[#edf0ea] px-3 py-3">
                    <p className="truncate text-sm font-bold text-[#294637]">
                      {displayName}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#8b998c]">
                      {admin.email || "Administrator"}
                    </p>

                    <span className="mt-2 inline-flex rounded-full bg-[#e9f1e6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#426c4b]">
                      Admin
                    </span>
                  </div>

                  <Link
                    to="/admin"
                    onClick={closeMenus}
                    className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#647a68] transition hover:bg-[#f0f4ee]"
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </Link>

                  <Link
                    to="/admin/orders"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#647a68] transition hover:bg-[#f0f4ee]"
                  >
                    <ClipboardList size={17} />
                    Manage Orders
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#a25c54] transition hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen((value) => !value);
                setAccountMenuOpen(false);
              }}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0f4ee] text-[#45634b] lg:hidden"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile and Tablet Menu */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile admin navigation"
            className="border-t border-[#e8ede5] bg-white px-4 pb-5 pt-4 shadow-lg lg:hidden"
          >
            <div className="mx-auto max-w-7xl space-y-1">
              {adminNavigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={closeMenus}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                        isActive
                          ? "bg-[#294637] text-white"
                          : "text-[#667c6a] hover:bg-[#f0f4ee]"
                      }`
                    }
                  >
                    <Icon size={19} />
                    {item.label}
                  </NavLink>
                );
              })}

              <Link
                to="/admin/products/new"
                onClick={closeMenus}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#45634b] hover:bg-[#f0f4ee]"
              >
                <Plus size={19} />
                Add Product
              </Link>

              <Link
                to="/admin/categories/new"
                onClick={closeMenus}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#45634b] hover:bg-[#f0f4ee]"
              >
                <Plus size={19} />
                Add Category
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-semibold text-[#a25c54] hover:bg-red-50"
              >
                <LogOut size={19} />
                Logout
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Admin Information Bar */}
      <div className="border-b border-[#e0e8dd] bg-[#edf3e9]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-[#607a64]">
            <ShieldCheck size={16} />
            <span>Administrator workspace — Manage your Furnispace store</span>
          </div>

          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#41674a] hover:text-[#294637]"
          >
            Manage catalogue <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Page Content */}
      <main className="w-full flex-1">
        <Outlet />
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-[#e4e9e1] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-xs text-[#8a998c] sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p>
            © {new Date().getFullYear()} Furnispace Admin. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <ShieldCheck size={15} />
            <span>Authorized administrator access</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AdminLayout;