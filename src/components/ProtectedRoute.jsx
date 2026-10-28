import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { FiLock, FiShieldCheck, FiHome, FiLogIn } from "react-icons/fi";

function ProtectedRoute({ adminOnly = false }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  const user = (() => {
    try {
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  })();

  // Redirect users who are not logged in.
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Restrict admin-only routes.
  if (adminOnly && user?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-[0_20px_60px_rgba(23,59,43,0.08)] sm:rounded-3xl sm:p-10">
          {/* Decorative background */}
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-50 sm:h-44 sm:w-44" />

          <div className="relative">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl text-amber-700 ring-1 ring-amber-100 sm:h-20 sm:w-20 sm:text-4xl">
              <FiLock />
            </div>

            {/* Status */}
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-600 sm:text-xs">
              <FiShieldCheck className="text-base" />
              Restricted access
            </span>

            {/* Message */}
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
              Admin access required
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-500 sm:text-base sm:leading-7">
              This area is reserved for authorized Furnispace administrators.
              Your current account does not have permission to view this page.
            </p>

            {/* Actions */}
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
              >
                <FiHome />
                Back to Store
              </Link>

              <Link
                to="/login"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
              >
                <FiLogIn />
                Sign In
              </Link>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="absolute bottom-0 left-0 h-1 w-full bg-linear-to-r from-emerald-950 via-amber-600 to-amber-300" />
        </div>
      </div>
    );
  }

  // Allow access to the requested protected page.
  return <Outlet />;
}

export default ProtectedRoute;
