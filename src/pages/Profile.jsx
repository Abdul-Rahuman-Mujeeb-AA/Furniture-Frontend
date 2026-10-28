import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Save,
  RefreshCw,
  Package,
  ArrowRight,
  CircleUserRound,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken");

const getProfileData = (response) => {
  const data = response?.data;

  return data?.user || data?.data?.user || data?.data || data || {};
};

const getAddress = (address) => {
  if (typeof address === "string") {
    return {
      address,
      apartment: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    };
  }

  return {
    address: address?.address || address?.street || "",
    apartment: address?.apartment || "",
    city: address?.city || "",
    state: address?.state || "",
    postalCode: address?.postalCode || address?.zipCode || "",
    country: address?.country || "India",
  };
};

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [lastSaved, setLastSaved] = useState("");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchProfile = async () => {
      try {
        const token = getToken();

        if (!token) {
          if (active) {
            setPageError("Please log in to view your profile.");
            setLoading(false);
          }
          return;
        }

        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const user = getProfileData(response);
        const address = getAddress(user.address);

        if (active) {
          setProfile({
            name: user.name || user.fullName || "",
            email: user.email || "",
            phone: user.phone || user.phoneNumber || "",
            ...address,
          });
        }
      } catch (error) {
        if (!active || error.code === "ERR_CANCELED") return;

        if (active) {
          setPageError(
            error.response?.data?.message ||
              "We couldn't load your account details. Please try again.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      toast.error("Please log in to update your profile.");
      return;
    }

    if (!profile.name.trim() || !profile.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        address: {
          address: profile.address.trim(),
          apartment: profile.apartment.trim(),
          city: profile.city.trim(),
          state: profile.state.trim(),
          postalCode: profile.postalCode.trim(),
          country: profile.country.trim(),
        },
      };

      const response = await axios.put(`${API_URL}/auth/profile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = getProfileData(response);
      const updatedAddress = getAddress(updatedUser.address ?? payload.address);

      setProfile({
        name: updatedUser.name || updatedUser.fullName || payload.name,
        email: updatedUser.email || payload.email,
        phone: updatedUser.phone || updatedUser.phoneNumber || payload.phone,
        ...updatedAddress,
      });

      setLastSaved(
        new Date().toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
        }),
      );

      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to save your profile. Check your backend update route.",
      );
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  if (loading) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#f7f6f2] px-4">
        <div className="text-center">
          <RefreshCw className="mx-auto h-9 w-9 animate-spin text-emerald-800" />
          <p className="mt-4 text-sm text-stone-600">Loading your account...</p>
        </div>
      </main>
    );
  }

  if (pageError) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#f7f6f2] px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <CircleUserRound className="mx-auto h-12 w-12 text-emerald-800" />
          <h1 className="mt-4 text-2xl font-semibold text-stone-900">
            Your account
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">{pageError}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Try again
            </button>
            <Link
              to="/login"
              className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f2] pb-16">
      <section className="overflow-hidden bg-[#173f35] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
                Furnispace / My account
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Your space,
                <br className="sm:hidden" /> your details.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-100 sm:text-base">
                Manage your personal information and delivery details in one
                place, so your next furniture order is ready to reach home.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm sm:min-w-72">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#d8c5a5] text-xl font-bold text-[#173f35]">
                {initials || <UserRound size={27} />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">
                  {profile.name || "Furnispace member"}
                </p>
                <p className="mt-1 truncate text-sm text-emerald-100">
                  {profile.email}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-200">
                  <ShieldCheck size={14} />
                  Account details
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Link
            to="/my-orders"
            className="group flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm sm:p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
                <Package size={23} />
              </div>
              <div>
                <h2 className="font-semibold text-stone-900">Your orders</h2>
                <p className="mt-1 text-sm text-stone-500">
                  View purchases and delivery status
                </p>
              </div>
            </div>
            <ArrowRight
              className="shrink-0 text-stone-400 transition group-hover:translate-x-1 group-hover:text-emerald-800"
              size={20}
            />
          </Link>

          <Link
            to="/products"
            className="group flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm sm:p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1e9dc] text-[#735b3e]">
                <CircleUserRound size={23} />
              </div>
              <div>
                <h2 className="font-semibold text-stone-900">
                  Explore furniture
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Find something for your space
                </p>
              </div>
            </div>
            <ArrowRight
              className="shrink-0 text-stone-400 transition group-hover:translate-x-1 group-hover:text-emerald-800"
              size={20}
            />
          </Link>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-5 py-6 sm:px-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-900">
                  <UserRound size={23} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-stone-900">
                    Personal information
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Keep your contact information up to date.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Full name
                </label>
                <div className="relative">
                  <UserRound
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    size={18}
                  />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={profile.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3.5 pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-100"
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
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    size={18}
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={profile.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3.5 pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Phone number
                </label>
                <div className="relative sm:max-w-md">
                  <Phone
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    size={18}
                  />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3.5 pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-5 py-6 sm:px-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f1e9dc] text-[#735b3e]">
                  <MapPin size={23} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-stone-900">
                    Delivery address
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Add the address where you'd like your furniture delivered.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Street address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="House number, street, area"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="apartment"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Apartment or landmark
                  <span className="ml-1 font-normal text-stone-400">
                    (optional)
                  </span>
                </label>
                <input
                  id="apartment"
                  name="apartment"
                  type="text"
                  value={profile.apartment}
                  onChange={handleChange}
                  placeholder="Apartment, floor, or nearby landmark"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  value={profile.city}
                  onChange={handleChange}
                  placeholder="Your city"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  autoComplete="address-level1"
                  value={profile.state}
                  onChange={handleChange}
                  placeholder="Your state"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Postal code
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  autoComplete="postal-code"
                  value={profile.postalCode}
                  onChange={handleChange}
                  placeholder="PIN code"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  autoComplete="country-name"
                  value={profile.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-emerald-800"
                size={21}
              />
              <div>
                <p className="text-sm font-semibold text-stone-800">
                  Your account, your information
                </p>
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  Save changes when your details are ready.
                </p>
                {lastSaved && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-800">
                    <CheckCircle2 size={14} />
                    Last saved at {lastSaved}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? (
                <RefreshCw className="animate-spin" size={17} />
              ) : (
                <Save size={17} />
              )}
              {saving ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Profile;