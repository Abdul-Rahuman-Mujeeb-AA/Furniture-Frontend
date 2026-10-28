import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiShoppingCart,
  FiSearch,
  FiArrowUpRight,
} from "react-icons/fi";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const navLinkClass = ({ isActive }) =>
    `relative py-2 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "text-emerald-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-amber-700"
        : "text-stone-600 hover:text-emerald-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex min-h-19 max-w-360 items-center justify-between gap-3 px-3 sm:px-5 lg:px-10">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Furnispace home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl rounded-bl-sm bg-emerald-950 text-2xl font-extrabold text-white shadow-sm">
            F.
          </span>

          <span className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-emerald-950 sm:text-2xl">
              Furni<span className="text-amber-700">Space</span>
            </span>
            <span className="mt-0.5 text-[8px] font-bold tracking-[0.22em] text-stone-500 sm:text-[9px]">
              LIVE BEAUTIFULLY
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-5 lg:flex xl:gap-8">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navLinkClass}>
            Shop
          </NavLink>

          <NavLink to="/categories" className={navLinkClass}>
            Categories
          </NavLink>

          <NavLink to="/my-orders" className={navLinkClass}>
            My Orders
          </NavLink>
        </nav>

        {/* Right-side actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <Link
            to="/products"
            aria-label="Browse products"
            title="Browse products"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-lg text-emerald-950 transition hover:border-emerald-900 hover:bg-emerald-50 sm:flex"
          >
            <FiSearch />
          </Link>

          <Link
            to="/cart"
            aria-label="Shopping cart"
            title="Shopping cart"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-lg text-emerald-950 transition hover:border-emerald-900 hover:bg-emerald-50 sm:h-10 sm:w-10"
          >
            <FiShoppingCart />
          </Link>

          {/* Login and Register stay on the right */}
          <div className="flex items-center gap-2 sm:ml-1 sm:gap-3">
            <Link
              to="/login"
              onClick={closeMenu}
              className="px-1.5 py-2 text-xs font-bold text-emerald-950 transition hover:text-amber-700 sm:px-2 sm:text-sm"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={closeMenu}
              className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg bg-emerald-950 px-2.5 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 sm:min-h-10 sm:gap-1.5 sm:px-4 sm:text-sm"
            >
              Register
              <FiArrowUpRight className="text-sm sm:text-base" />
            </Link>
          </div>

          {/* Mobile/tablet menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-xl text-emerald-950 transition hover:bg-stone-100 lg:hidden sm:h-10 sm:w-10"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile and tablet navigation dropdown */}
      {menuOpen && (
        <nav className="border-t border-stone-100 bg-white px-5 py-3 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-360 flex-col">
            <NavLink
              to="/"
              end
              onClick={closeMenu}
              className={({ isActive }) =>
                `rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-950"
                    : "text-stone-600 hover:bg-stone-50 hover:text-emerald-950"
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              onClick={closeMenu}
              className={({ isActive }) =>
                `rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-950"
                    : "text-stone-600 hover:bg-stone-50 hover:text-emerald-950"
                }`
              }
            >
              Shop All Furniture
            </NavLink>

            <NavLink
              to="/categories"
              onClick={closeMenu}
              className={({ isActive }) =>
                `rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-950"
                    : "text-stone-600 hover:bg-stone-50 hover:text-emerald-950"
                }`
              }
            >
              Categories
            </NavLink>

            <NavLink
              to="/my-orders"
              onClick={closeMenu}
              className={({ isActive }) =>
                `rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-950"
                    : "text-stone-600 hover:bg-stone-50 hover:text-emerald-950"
                }`
              }
            >
              My Orders
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;