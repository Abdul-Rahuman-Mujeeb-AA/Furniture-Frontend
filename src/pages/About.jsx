import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiHeart,
  FiHome,
  FiLayers,
  FiShield,
  FiTruck,
} from "react-icons/fi";

const values = [
  {
    icon: FiLayers,
    title: "Thoughtful Design",
    description:
      "Discover furniture that balances everyday comfort with timeless style.",
  },
  {
    icon: FiShield,
    title: "Quality First",
    description:
      "We focus on practical, well-designed pieces for your everyday living.",
  },
  {
    icon: FiHeart,
    title: "Made for Living",
    description:
      "Find pieces that help make your home feel personal, warm, and inviting.",
  },
  {
    icon: FiTruck,
    title: "Convenient Shopping",
    description:
      "Explore our collection online and place your furniture order with ease.",
  },
];

export default function About() {
  return (
    <main className="overflow-hidden bg-[#faf9f6] text-stone-800">
      {/* Hero */}
      <section className="relative bg-[#193c32] text-white">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10 sm:h-96 sm:w-96" />
        <div className="absolute -right-8 -top-12 h-56 w-56 rounded-full border border-white/10 sm:h-72 sm:w-72" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              <FiHome size={15} />
              About Furnispace
            </span>

            <h1 className="mt-7 max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Furniture for the way you{" "}
              <span className="font-serif italic text-[#d8e7c3]">live.</span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-emerald-50/80 sm:text-base">
              Furnispace helps you discover furniture that brings comfort,
              function, and character into your home. From everyday essentials
              to statement pieces, find inspiration for spaces that feel like
              you.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d8e7c3] px-6 py-3.5 text-sm font-bold text-[#193c32] transition hover:bg-white"
              >
                Explore our collection
                <FiArrowRight size={17} />
              </Link>

              <Link
                to="/categories"
                className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Browse categories
              </Link>
            </div>

            <div className="mt-9 flex items-center gap-3 text-sm text-emerald-50/80">
              <FiCheckCircle className="shrink-0 text-[#d8e7c3]" size={18} />
              <span>
                Simple browsing. Thoughtful choices. Comfortable living.
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-3 rotate-3 rounded-4xl bg-[#d8e7c3]/15" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#e8e1d5]">
              <img
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"
                alt="Warm, thoughtfully furnished living room"
                className="h-72 w-full object-cover sm:h-96 lg:h-110"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/20 to-transparent p-6 pt-20 sm:p-8 sm:pt-24">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                  Your space, your story
                </p>
                <p className="mt-2 max-w-sm text-2xl font-semibold text-white sm:text-3xl">
                  Make room for what matters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-10 lg:py-24">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">
            Our story
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-4xl">
            A more personal way to furnish your home.
          </h2>
        </div>

        <div className="max-w-2xl">
          <p className="text-base leading-8 text-stone-600">
            We believe a home should reflect the people who live in it.
            Furnispace brings furniture discovery into one convenient online
            destination, helping you explore products, compare options, and
            choose pieces that suit your space and lifestyle.
          </p>
          <p className="mt-5 text-base leading-8 text-stone-600">
            Whether you are refreshing one corner or furnishing an entire room,
            our goal is to make finding your next piece straightforward and
            enjoyable.
          </p>

          <Link
            to="/categories"
            className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 transition hover:text-emerald-600"
          >
            Find your style
            <FiArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">
              The Furnispace difference
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              Good spaces start with good choices.
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-500 sm:text-base">
              Our approach is simple: make furniture shopping clear, convenient,
              and focused on the things that matter at home.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <article
                  key={value.title}
                  className="group rounded-2xl border border-stone-200 bg-[#faf9f6] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-800/30 hover:shadow-lg hover:shadow-stone-200/50 sm:p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7efdf] text-emerald-900 transition group-hover:bg-[#193c32] group-hover:text-white">
                    <Icon size={23} />
                  </div>

                  <p className="mt-6 text-xs font-semibold tracking-widest text-stone-400">
                    0{index + 1}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-stone-900">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-stone-500">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-[#e8e6dc] px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border border-emerald-900/10 sm:h-72 sm:w-72" />
          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">
                Your next chapter starts at home
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-4xl">
                Find the pieces that make it yours.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600 sm:text-base">
                Explore our furniture collection and discover ideas for a space
                that feels comfortable, functional, and uniquely yours.
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#193c32] px-6 py-4 text-sm font-bold text-white transition hover:bg-emerald-900"
            >
              Shop furniture
              <FiArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
