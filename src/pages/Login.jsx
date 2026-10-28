import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ArrowRight,
  ShieldCheck,
  Armchair,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

import authService from "../services/authService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const email = formData.email.trim().toLowerCase();

    if (!email || !formData.password) {
      setError("Please enter your email address and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({
        email,
        password: formData.password,
      });

      // Support common response formats from Express APIs.
      const data = response?.data || response;
      const user = data?.user;

      toast.success("Welcome back!");

      const requestedPath = location.state?.from?.pathname;

      if (requestedPath && requestedPath !== "/login") {
        navigate(requestedPath, { replace: true });
      } else if (user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please check your credentials and try again.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[80vh] bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-4xl border border-stone-200 bg-white shadow-sm lg:grid-cols-2">
          {/* Left visual panel */}
          <section className="relative hidden min-h-162.5 overflow-hidden bg-emerald-950 lg:block">
            <img
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=85"
              alt="Comfortable modern living room"
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />

            <div className="absolute inset-0 bg-linear-to-t from-emerald-950 via-emerald-950/35 to-transparent" />

            <div className="absolute left-10 top-10 flex items-center gap-3 text-white">
              <span className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                <Armchair size={27} />
              </span>
              <div>
                <p className="text-xl font-semibold tracking-tight">
                  Furnispace
                </p>
                <p className="text-xs text-white/70">
                  Furniture for better living
                </p>
              </div>
            </div>

            <div className="absolute inset-x-10 bottom-12 text-white xl:inset-x-12">
              <span className="inline-flex rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/90">
                Your home, your story
              </span>

              <h1 className="mt-6 font-serif text-4xl leading-tight xl:text-5xl">
                Come home to
                <span className="block italic text-amber-200">
                  something beautiful.
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/80">
                Sign in to explore your favourite furniture, keep track
                of your orders, and make your space feel more like you.
              </p>

              <div className="mt-8 flex items-center gap-3 border-t border-white/20 pt-6">
                <ShieldCheck size={22} className="text-amber-200" />
                <p className="text-sm text-white/80">
                  Your account makes shopping easier.
                </p>
              </div>
            </div>
          </section>

          {/* Login form */}
          <section className="flex items-center justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
            <div className="w-full max-w-md">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 lg:hidden"
              >
                <Armchair size={23} />
                Furnispace
              </Link>

              <div className="mt-7 lg:mt-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
                  Welcome back
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                  Sign in to your account
                </h2>

                <p className="mt-3 text-sm leading-6 text-stone-500 sm:text-base">
                  Access your orders and continue creating a home you love.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-stone-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                    />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-stone-200 bg-[#faf9f6] py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:bg-white focus:ring-4 focus:ring-emerald-900/5"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-stone-700"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-emerald-800 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-stone-200 bg-[#faf9f6] py-3.5 pl-12 pr-12 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:bg-white focus:ring-4 focus:ring-emerald-900/5"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone-400 hover:text-emerald-900"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-stone-200" />
                <span className="text-xs text-stone-400">
                  NEW TO FURNISPACE?
                </span>
                <div className="h-px flex-1 bg-stone-200" />
              </div>

              <Link
                to="/register"
                className="flex w-full items-center justify-center rounded-xl border border-stone-300 px-5 py-3.5 text-sm font-semibold text-stone-800 transition hover:border-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
              >
                Create an account
              </Link>

              <p className="mt-7 text-center text-xs leading-6 text-stone-500">
                By signing in, you agree to our{" "}
                <Link
                  to="/terms-and-conditions"
                  className="font-medium text-emerald-800 hover:underline"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy-policy"
                  className="font-medium text-emerald-800 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
