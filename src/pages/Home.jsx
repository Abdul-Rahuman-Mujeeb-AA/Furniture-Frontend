import { Link } from "react-router-dom";
import {
  ArrowRight,
  Armchair,
  BadgeCheck,
  ChevronRight,
  Heart,
  Layers3,
  Leaf,
  LockKeyhole,
  MoveUpRight,
  ShieldCheck,
  Sofa,
  Sparkles,
  Users,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85";

const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85";

const SHOWCASE_IMAGES = [
  {
    title: "Living spaces",
    subtitle: "Comfort meets character",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Restful bedrooms",
    subtitle: "Calm in every corner",
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Dining moments",
    subtitle: "Made for gathering",
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=85",
  },
];

const FEATURES = [
  {
    icon: Armchair,
    title: "Furniture for every room",
    description:
      "Explore furniture inspiration for living rooms, bedrooms, dining spaces, and more.",
  },
  {
    icon: Leaf,
    title: "Thoughtful design",
    description:
      "Discover our approach to comfortable spaces, timeless shapes, and practical living.",
  },
  {
    icon: ShieldCheck,
    title: "Account-based shopping",
    description:
      "Register and sign in to access the shopping experience and manage your orders.",
  },
  {
    icon: BadgeCheck,
    title: "Admin-managed catalogue",
    description:
      "Products available inside the shopping area are created and managed by our store admin.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create an account",
    description: "Register with your details to begin your Furnispace journey.",
  },
  {
    number: "02",
    title: "Sign in securely",
    description: "Log in to access your personal shopping dashboard.",
  },
  {
    number: "03",
    title: "Explore the catalogue",
    description: "Browse furniture products added and managed by the admin.",
  },
  {
    number: "04",
    title: "Shop from your account",
    description:
      "Select products, manage your cart, and place orders after signing in.",
  },
];

function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f7f3] text-[#263c30]">
      <Navbar />

      <main>
        {/* HERO - INTRODUCTION ONLY */}
        <section className="relative isolate min-h-155 overflow-hidden bg-[#20372b] sm:min-h-175 lg:min-h-190">
          <img
            src={HERO_IMAGE}
            alt="Beautifully furnished contemporary living room"
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />

          <div className="absolute inset-0 bg-linear-to-r from-[#14291e]/90 via-[#14291e]/70 to-[#14291e]/25" />
          <div className="absolute inset-0 bg-linear-to-t from-[#14291e]/50 via-transparent to-transparent" />

          <div className="relative mx-auto flex min-h-155 max-w-7xl items-center px-5 py-24 sm:min-h-175 lg:min-h-190">
            <div className="max-w-3xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium tracking-wide text-white backdrop-blur-md sm:text-sm">
                <Sparkles size={15} />
                Welcome to Furnispace
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[76px]">
                A beautiful home
                <span className="block font-serif font-normal italic text-[#d9e4cf]">
                  begins with inspiration.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-sm leading-8 text-[#e1e8df] sm:text-base lg:text-lg">
                Discover Furnispace, a furniture shopping destination created
                for modern living. Explore our story, find inspiration, and
                begin your shopping journey by creating an account.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[#e4eddb] px-7 py-4 text-sm font-semibold text-[#20372b] transition duration-300 hover:-translate-y-0.5 hover:bg-white"
                >
                  Get started
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-white/40 bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:border-white hover:bg-white/20"
                >
                  Already a member? Sign in
                  <MoveUpRight size={17} />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-[#e0e9de] sm:text-sm">
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck size={17} />
                  Curated furniture inspiration
                </span>

                <span className="inline-flex items-center gap-2">
                  <LockKeyhole size={17} />
                  Shopping after login
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-5 hidden items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs font-medium text-white backdrop-blur-md lg:flex">
            <span className="h-2 w-2 rounded-full bg-[#dce8d3]" />
            Spaces that feel like home
          </div>
        </section>

        {/* BRAND INTRODUCTION */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#6d826d]">
                <span className="h-px w-8 bg-[#6d826d]" />
                Our story
              </div>

              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                More than furniture.
                <span className="block font-serif font-normal italic text-[#738a70]">
                  A feeling of home.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-8 text-[#778278] sm:text-base">
                At Furnispace, we believe the spaces around us shape the way we
                live. A comfortable sofa, a welcoming dining table, or a
                peaceful bedroom can turn everyday moments into meaningful
                memories.
              </p>

              <p className="mt-4 max-w-xl text-sm leading-8 text-[#778278] sm:text-base">
                Our platform brings furniture discovery into one simple
                experience. Visitors can explore our brand, while registered
                users can access the product catalogue and shop furniture
                managed by our admin team.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:max-w-md">
                <div className="rounded-2xl border border-[#e4e7df] bg-white p-5">
                  <Sofa
                    size={25}
                    className="mb-3 text-[#56735b]"
                    strokeWidth={1.6}
                  />
                  <h3 className="text-sm font-semibold">Inspired interiors</h3>
                  <p className="mt-1 text-xs leading-5 text-[#8a958a]">
                    Ideas for comfortable living
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e4e7df] bg-white p-5">
                  <Layers3
                    size={25}
                    className="mb-3 text-[#56735b]"
                    strokeWidth={1.6}
                  />
                  <h3 className="text-sm font-semibold">Curated collections</h3>
                  <p className="mt-1 text-xs leading-5 text-[#8a958a]">
                    Explore after signing in
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-4xl bg-[#e6e8e1]">
                <img
                  src={ABOUT_IMAGE}
                  alt="Warm modern home interior with natural furniture"
                  loading="lazy"
                  className="h-95 w-full object-cover sm:h-120 lg:h-140"
                />
              </div>

              <div className="absolute -bottom-5 left-4 right-4 rounded-2xl border border-white/80 bg-white/95 p-5 shadow-xl shadow-[#263c30]/10 backdrop-blur-md sm:-bottom-8 sm:left-auto sm:right-2.5 sm:max-w-67.5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf0e6] text-[#49674e]">
                    <Heart size={21} />
                  </div>
                  <p className="text-sm font-semibold">
                    Designed around
                    <span className="block">the way you live.</span>
                  </p>
                </div>
                <p className="mt-3 text-xs leading-6 text-[#7d8a7e]">
                  Explore the Furnispace experience and find inspiration for
                  your next space.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* INSPIRATION GALLERY - NOT PRODUCTS */}
        <section className="bg-[#eeefe9] py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#70836f]">
                  Find your inspiration
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  Every room has a story.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#788579] sm:text-base">
                  A glimpse into the spaces that inspire us. These images are
                  for design inspiration only, not individual products for
                  purchase.
                </p>
              </div>

              <Link
                to="/register"
                className="inline-flex w-fit items-center gap-2 border-b border-[#3b5943] pb-1 text-sm font-semibold text-[#3b5943] transition hover:gap-3"
              >
                Join Furnispace
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {SHOWCASE_IMAGES.map((space, index) => (
                <div
                  key={space.title}
                  className={`group relative overflow-hidden rounded-[1.6rem] bg-[#dce2d8] ${
                    index === 1 ? "md:mt-10" : ""
                  }`}
                >
                  <div className="relative h-90 overflow-hidden sm:h-110 md:h-105 lg:h-120">
                    <img
                      src={space.image}
                      alt={`${space.title} furniture interior inspiration`}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-[#14281d]/85 via-[#14281d]/10 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-7">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#d7e3d5]">
                        Inspiration / 0{index + 1}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold">
                        {space.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#e0e7dd]">
                        {space.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-xs leading-6 text-[#829083]">
              Inspiration gallery only. Actual products, prices, and
              availability are shown inside the shopping area after login.
            </p>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#70836f]">
              The Furnispace experience
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              A thoughtful way to
              <span className="block font-serif font-normal italic text-[#738a70]">
                discover your style.
              </span>
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#7c887c] sm:text-base">
              Get to know what Furnispace offers before you begin your personal
              shopping experience.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-3xl border border-[#e4e8df] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#c9d5c7] hover:shadow-xl hover:shadow-[#263c30]/5 sm:p-7"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef2ea] text-[#4f6d54] transition group-hover:bg-[#294637] group-hover:text-white">
                      <Icon size={25} strokeWidth={1.6} />
                    </div>
                    <span className="text-xs font-medium text-[#a1ada1]">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="mt-8 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#7c887c]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SHOPPING PROCESS */}
        <section className="bg-[#253d30] py-20 text-white sm:py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b6cbb4]">
                  How it works
                </p>
                <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  Your home journey,
                  <span className="block font-serif font-normal italic text-[#c7d9bd]">
                    made simple.
                  </span>
                </h2>
                <p className="mt-6 max-w-md text-sm leading-8 text-[#c7d4c8] sm:text-base">
                  Furnispace keeps the public introduction separate from the
                  shopping experience. Create an account and sign in to access
                  products available in the store.
                </p>

                <Link
                  to="/register"
                  className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#e4eddb] px-7 py-3.5 text-sm font-semibold text-[#263d30] transition hover:bg-white"
                >
                  Create your account
                  <ArrowRight size={17} />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {STEPS.map((step) => (
                  <div
                    key={step.number}
                    className="rounded-3xl border border-white/15 bg-white/6 p-6 sm:p-7"
                  >
                    <span className="font-serif text-4xl italic text-[#b6cbb4]">
                      {step.number}
                    </span>
                    <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#c4d0c4]">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ACCOUNT ACCESS NOTE */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="grid items-center gap-8 overflow-hidden rounded-4xl border border-[#e2e7dd] bg-[#eaf0e6] p-6 sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:gap-10 lg:p-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-[#3e6145]">
              <LockKeyhole size={34} strokeWidth={1.5} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#718771]">
                Shopping access
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Explore products after signing in.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#748474]">
                The images on this homepage are not products and cannot be added
                to your cart or ordered. After registering and logging in, you
                can visit the shopping dashboard to browse products created by
                the store admin.
              </p>
            </div>

            <Link
              to="/login"
              className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-[#294637] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e3528]"
            >
              Sign in
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden bg-[#e9e8df]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#4f6c53]">
                <Users size={24} strokeWidth={1.6} />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#70836f]">
                Become part of Furnispace
              </p>

              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Your next chapter
                <span className="block font-serif font-normal italic text-[#71886f]">
                  starts at home.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-[#788579] sm:text-base">
                Ready to explore our furniture catalogue? Register today, sign
                in, and discover the products available inside your shopping
                account.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#294637] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#1e3528] sm:w-auto"
                >
                  Register now
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#bfcbbd] bg-white px-7 py-4 text-sm font-semibold text-[#294637] transition hover:bg-[#f7faf5] sm:w-auto"
                >
                  Login
                  <ChevronRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;