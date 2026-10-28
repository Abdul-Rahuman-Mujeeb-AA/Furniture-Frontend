import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Armchair,
  ArrowRight,
  Eye,
  EyeOff,
  UserRound,
  Mail,
  LockKeyhole,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";

import authService from "../services/authService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.password || !form.confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Backend registration expects name, email and password.
      const response = await authService.register({
        name,
        email,
        password: form.password,
      });

      const data = response?.data || response;

      toast.success("Your account has been created successfully!");

      // If registration also logs the user in, go to the homepage.
      // Otherwise, send the user to the login page.
      const token =
        data?.token || data?.accessToken || localStorage.getItem("token");

      navigate(token ? "/" : "/login", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = [
    {
      label: "At least 6 characters",
      valid: form.password.length >= 6,
    },
    {
      label: "Passwords match",
      valid:
        form.confirmPassword.length > 0 &&
        form.password === form.confirmPassword,
    },
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-[75vh] bg-[#f8f7f3] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm lg:grid-cols-2">
          {/* Visual panel */}
          <section className="relative hidden min-h-180 overflow-hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=85"
              alt="Warm and inviting modern living room"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-linear-to-t from-emerald-950 via-emerald-950/45 to-emerald-950/10" />

            <Link
              to="/"
              className="absolute left-10 top-10 flex items-center gap-3 text-white"
            >
              <span className="rounded-xl bg-white/15 p-3 backdrop-blur">
                <Armchair size={28} />
              </span>
              <span>
                <span className="block text-xl font-bold">Furnispace</span>
                <span className="text-xs text-white/75">
                  Furniture for better living
                </span>
              </span>
            </Link>

            <div className="absolute bottom-12 left-10 right-10 text-white xl:left-12">
              <span className="rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.2em]">
                Your home, your story
              </span>

              <h1 className="mt-6 font-serif text-4xl leading-tight xl:text-5xl">
                Good spaces start
                <span className="block italic text-amber-200">
                  with inspiration.
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/80">
                Create your account to discover thoughtful furniture, save your
                favourites, and keep your orders close at hand.
              </p>

              <div className="mt-8 space-y-4 border-t border-white/20 pt-6">
                {[
                  "Discover furniture for every room",
                  "Track your orders in one place",
                  "Make your home uniquely yours",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 size={19} className="text-amber-200" />
                    <span className="text-sm text-white/90">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Registration form */}
          <section className="flex items-center justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
            <div className="w-full max-w-md">
              <Link
                to="/"
                className="inline-flex items-center gap-2 font-bold text-emerald-900 lg:hidden"
              >
                <Armchair size={25} />
                Furnispace
              </Link>

              <div className="mt-7 lg:mt-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
                  Join Furnispace
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                  Create your account.
                </h2>

                <p className="mt-3 text-sm leading-6 text-stone-500 sm:text-base">
                  A more comfortable home is just a few details away.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-stone-700"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      maxLength={80}
                      className="w-full rounded-xl border border-stone-200 bg-[#faf9f6] py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-800 focus:bg-white focus:ring-4 focus:ring-emerald-900/5"
                    />
                  </div>
                </div>

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
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-stone-200 bg-[#faf9f6] py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-800 focus:bg-white focus:ring-4 focus:ring-emerald-900/5"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-stone-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-stone-200 bg-[#faf9f6] py-3.5 pl-12 pr-12 text-sm outline-none transition focus:border-emerald-800 focus:bg-white focus:ring-4 focus:ring-emerald-900/5"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone-400 hover:text-emerald-900"
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-stone-700"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <ShieldCheck
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-stone-200 bg-[#faf9f6] py-3.5 pl-12 pr-12 text-sm outline-none transition focus:border-emerald-800 focus:bg-white focus:ring-4 focus:ring-emerald-900/5"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone-400 hover:text-emerald-900"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-xl bg-stone-50 p-3">
                  {passwordChecks.map((check) => (
                    <p
                      key={check.label}
                      className={`flex items-center gap-2 text-xs ${
                        check.valid ? "text-emerald-800" : "text-stone-500"
                      }`}
                    >
                      <CheckCircle2 size={15} />
                      {check.label}
                    </p>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create my account"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-stone-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-emerald-800 hover:underline"
                >
                  Sign in
                </Link>
              </p>

              <p className="mt-5 text-center text-xs leading-6 text-stone-500">
                By creating an account, you agree to our{" "}
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