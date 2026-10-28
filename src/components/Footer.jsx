import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiArrowRight,
  FiMapPin,
  FiPhone,
  FiMail,
  FiInstagram,
  FiFacebook,
  FiTruck,
  FiShield,
  FiRefreshCw,
} from "react-icons/fi";

function Footer() {
  const currentYear = new Date().getFullYear();

  const shopLinks = [
    { label: "All Furniture", to: "/products" },
    { label: "Categories", to: "/categories" },
    { label: "Living Room", to: "/categories" },
    { label: "Bedroom Furniture", to: "/categories" },
  ];

  const customerLinks = [
    { label: "My Account", to: "/profile" },
    { label: "My Orders", to: "/my-orders" },
    { label: "Shopping Cart", to: "/cart" },
    { label: "Contact Us", to: "/contact" },
  ];

  return (
    <footer className="mt-16 bg-[#173b2b] text-white">
      {/* Newsletter banner */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-10 sm:px-8 md:grid-cols-2 md:items-center lg:px-10 lg:py-14">
          <div>
            <span className="mb-3 inline-block rounded-full border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9c19c]">
              The Furnispace Journal
            </span>

            <h2 className="max-w-lg text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              Make room for
              <span className="font-serif italic text-[#d9c19c]">
                {" "}beautiful living.
              </span>
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
              Discover furniture inspiration, thoughtful design ideas, and
              updates for your home.
            </p>
          </div>

          <form
            className="flex w-full max-w-xl items-center gap-2 rounded-xl bg-white p-2 md:ml-auto"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>

            <input
              id="footer-email"
              type="email"
              placeholder="Enter your email address"
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-stone-800 outline-none placeholder:text-stone-400"
              required
            />

            <button
              type="submit"
              className="flex shrink-0 items-center gap-2 rounded-lg bg-[#173b2b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#28563f]"
            >
              Subscribe <FiArrowRight />
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand and description */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl rounded-bl-sm bg-[#d9c19c] text-2xl font-extrabold text-[#173b2b]">
                F.
              </span>

              <span>
                <span className="block text-2xl font-extrabold tracking-tight">
                  furni<span className="text-[#d9c19c]">space</span>
                </span>
                <span className="mt-1 block text-[9px] font-bold tracking-[0.24em] text-white/50">
                  LIVE BEAUTIFULLY
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
              Furniture that feels like home. Explore thoughtfully selected
              pieces that bring comfort, character, and timeless style to
              your everyday spaces.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-lg text-white/75 transition hover:border-[#d9c19c] hover:bg-[#d9c19c] hover:text-[#173b2b]"
              >
                <FiInstagram />
              </a>

              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-lg text-white/75 transition hover:border-[#d9c19c] hover:bg-[#d9c19c] hover:text-[#173b2b]"
              >
                <FiFacebook />
              </a>
            </div>
          </div>

          {/* Shop links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h3 className="text-sm font-bold tracking-wide text-white">
              Explore
            </h3>

            <ul className="mt-5 space-y-3.5">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-white/60 transition hover:text-[#d9c19c]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer service */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold tracking-wide text-white">
              Customer Care
            </h3>

            <ul className="mt-5 space-y-3.5">
              {customerLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-white/60 transition hover:text-[#d9c19c]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold tracking-wide text-white">
              Get in Touch
            </h3>

            <ul className="mt-5 space-y-4">
              <li className="flex items-start gap-3 text-sm leading-6 text-white/65">
                <FiMapPin className="mt-1 shrink-0 text-[#d9c19c]" />
                <span>
                  Furniture shopping, made simple.
                  <br />
                  Serving customers online.
                </span>
              </li>

              <li className="flex items-center gap-3 text-sm text-white/65">
                <FiPhone className="shrink-0 text-[#d9c19c]" />
                <a href="tel:+910000000000" className="hover:text-[#d9c19c]">
                  Add your support phone
                </a>
              </li>

              <li className="flex items-center gap-3 text-sm text-white/65">
                <FiMail className="shrink-0 text-[#d9c19c]" />
                <a
                  href="mailto:support@yourstore.com"
                  className="break-all hover:text-[#d9c19c]"
                >
                  support@yourstore.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Service highlights */}
        <div className="mt-12 grid grid-cols-1 gap-4 border-y border-white/10 py-7 sm:grid-cols-3 sm:gap-5">
          <div className="flex items-center gap-3">
            <FiTruck className="shrink-0 text-2xl text-[#d9c19c]" />
            <div>
              <p className="text-sm font-semibold">Delivery Information</p>
              <p className="mt-1 text-xs text-white/50">
                Check delivery options at checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FiShield className="shrink-0 text-2xl text-[#d9c19c]" />
            <div>
              <p className="text-sm font-semibold">Secure Shopping</p>
              <p className="mt-1 text-xs text-white/50">
                Shop with confidence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FiRefreshCw className="shrink-0 text-2xl text-[#d9c19c]" />
            <div>
              <p className="text-sm font-semibold">Returns & Support</p>
              <p className="mt-1 text-xs text-white/50">
                Contact us for assistance
              </p>
            </div>
          </div>
        </div>

        {/* Legal links and copyright */}
        <div className="flex flex-col gap-4 pt-7 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} Furnispace. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-3">
            <Link
              to="/privacy-policy"
              className="transition hover:text-[#d9c19c]"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms-and-conditions"
              className="transition hover:text-[#d9c19c]"
            >
              Terms & Conditions
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-1 transition hover:text-[#d9c19c]"
            >
              Help <FiArrowUpRight />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
