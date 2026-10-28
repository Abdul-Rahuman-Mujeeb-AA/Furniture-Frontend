import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiHome,
  FiSearch,
  FiShoppingBag,
} from "react-icons/fi";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f5f0] px-4 py-12 text-[#193c32] sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#dce8dd] opacity-70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#e8dfce] opacity-70 blur-3xl" />

      <section className="relative w-full max-w-5xl">
        <div className="grid overflow-hidden rounded-3xl border border-[#e7e5dc] bg-white shadow-xl shadow-[#193c32]/5 md:grid-cols-2">
          {/* Illustration panel */}
          <div className="relative flex min-h-75 flex-col items-center justify-center overflow-hidden bg-[#193c32] p-8 text-center text-white sm:min-h-97.5 sm:p-12">
            <div className="absolute left-6 top-6 h-20 w-20 rounded-full border border-white/10" />
            <div className="absolute bottom-8 right-8 h-32 w-32 rounded-full border border-white/10" />

            <span className="mb-5 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#d6dfc8]">
              Furnispace
            </span>

            <div className="relative mb-5 flex items-center justify-center">
              <div className="absolute h-44 w-44 rounded-full bg-[#d9e4d1]/10 blur-2xl sm:h-56 sm:w-56" />
              <span className="relative text-[108px] font-black leading-none tracking-tighter text-[#e2e8d8] sm:text-[140px]">
                404
              </span>
            </div>

            <div className="relative max-w-xs">
              <p className="text-lg font-medium text-white sm:text-xl">
                Looks like this space is empty.
              </p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                The page you are looking for may have moved or no longer exists.
              </p>
            </div>

            <div className="absolute bottom-5 left-0 right-0 text-center text-[10px] uppercase tracking-[0.3em] text-white/35">
              Find your space. Find your style.
            </div>
          </div>

          {/* Message panel */}
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2e9] text-[#315e49]">
              <FiSearch size={23} />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#71816d]">
              Error 404
            </p>

            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              This page has
              <span className="block text-[#718b63]">gone missing.</span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#69736c] sm:text-base">
              Even the best-designed spaces have a corner we can't find.
              Let's get you back to exploring furniture, discovering your
              favourite styles, and creating a home you love.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#193c32] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#285644] focus:outline-none focus:ring-2 focus:ring-[#71917c] focus:ring-offset-2"
              >
                <FiHome size={17} />
                Back to Home
                <FiArrowRight size={16} />
              </Link>

              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe4dc] bg-white px-5 py-3.5 text-sm font-semibold text-[#29483a] transition hover:border-[#a9bba8] hover:bg-[#f5f7f2] focus:outline-none focus:ring-2 focus:ring-[#71917c] focus:ring-offset-2"
              >
                <FiShoppingBag size={17} />
                Explore Products
              </Link>
            </div>

            <div className="mt-9 border-t border-[#eceee8] pt-5">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#7a847c] transition hover:text-[#193c32]"
              >
                <FiArrowLeft size={15} />
                Return to the main page
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-[#8a9189]">
          Furnispace · Thoughtful furniture for everyday living
        </p>
      </section>
    </main>
  );
}
