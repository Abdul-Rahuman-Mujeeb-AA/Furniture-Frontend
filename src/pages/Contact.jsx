import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiSend,
} from "react-icons/fi";

const CONTACT_EMAIL = "www.abdul2006ghs@gmail.com";

const initialForm = {
  name: "",
  email: "",
  subject: "General enquiry",
  message: "",
};

const contactOptions = [
  {
    icon: FiMail,
    title: "Email us",
    detail: CONTACT_EMAIL,
    description: "For questions, suggestions, and support.",
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: FiMessageCircle,
    title: "Product enquiries",
    detail: "Need help choosing?",
    description: "Tell us what you are looking for and we will review your enquiry.",
    href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Product enquiry")}`,
  },
  {
    icon: FiClock,
    title: "Response time",
    detail: "We aim to reply promptly",
    description: "Response times may vary depending on the volume of messages.",
    href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Support request")}`,
  },
];

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [readyToEmail, setReadyToEmail] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setReadyToEmail(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Please enter your name.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.message.trim()) {
      nextErrors.message = "Please enter your message.";
    } else if (form.message.trim().length < 10) {
      nextErrors.message = "Please enter at least 10 characters.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setReadyToEmail(false);
      return;
    }

    const subject = `[Furnispace Contact] ${form.subject}`;
    const body = [
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      "",
      "Message:",
      form.message.trim(),
    ].join("\n");

    const mailtoUrl =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    setReadyToEmail(true);
    window.location.href = mailtoUrl;
  };

  const inputClass =
    "w-full rounded-xl border border-stone-200 bg-[#faf9f6] px-4 py-3.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:bg-white focus:ring-4 focus:ring-emerald-800/10";

  return (
    <main className="min-h-screen overflow-hidden bg-[#faf9f6] text-stone-800">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#193c32] text-white">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10 sm:h-96 sm:w-96" />
        <div className="absolute -right-5 -top-10 h-48 w-48 rounded-full border border-white/10 sm:h-64 sm:w-64" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-24">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-100 transition hover:text-white"
            >
              <FiArrowLeft size={16} />
              Back to home
            </Link>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
              <FiMessageCircle size={15} />
              We are listening
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Let’s talk about your{" "}
              <span className="font-serif italic text-[#d8e7c3]">
                space.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-emerald-50/80 sm:text-base">
              Have a question about furniture, an order, or our store? Send us
              a message. We would like to hear your feedback and help where we
              can.
            </p>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-8 inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] p-4 transition hover:bg-white/12 sm:p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d8e7c3] text-[#193c32]">
                <FiMail size={21} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-emerald-100/70">
                  Write to us directly
                </span>
                <span className="mt-1 block break-all text-sm font-semibold text-white sm:text-base">
                  {CONTACT_EMAIL}
                </span>
              </span>
              <FiArrowRight className="ml-1 shrink-0" size={18} />
            </a>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-3 rotate-2 rounded-4xl bg-white/10" />
            <div className="relative overflow-hidden rounded-[1.75rem]">
              <img
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"
                alt="A warm and inviting modern living room"
                className="h-64 w-full object-cover sm:h-80 lg:h-97.5"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#102a23]/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                  Your home matters
                </p>
                <p className="mt-2 max-w-sm text-2xl font-semibold leading-snug text-white sm:text-3xl">
                  Every good experience starts with a conversation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact information */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contactOptions.map((option) => {
            const Icon = option.icon;

            return (
              <a
                key={option.title}
                href={option.href}
                className="group rounded-2xl border border-stone-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-800/30 hover:shadow-lg hover:shadow-stone-200/50 sm:p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e7efdf] text-emerald-900 transition group-hover:bg-[#193c32] group-hover:text-white">
                  <Icon size={22} />
                </div>

                <h2 className="mt-5 text-lg font-bold text-stone-900">
                  {option.title}
                </h2>
                <p className="mt-1 wrap-break-word text-sm font-semibold text-emerald-800">
                  {option.detail}
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-500">
                  {option.description}
                </p>
              </a>
            );
          })}
        </div>
      </section>

      {/* Contact form */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <div className="grid overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="relative overflow-hidden bg-[#e9e8dd] p-6 sm:p-9 lg:p-10">
            <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full border border-emerald-900/10" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
                Get in touch
              </p>

              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-4xl">
                Tell us what’s on your mind.
              </h2>

              <p className="mt-4 text-sm leading-7 text-stone-600">
                Fill in the form and your email application will open with
                your message prepared and addressed to our contact email.
              </p>

              <div className="mt-8 space-y-4 border-t border-stone-300/80 pt-6">
                <div className="flex items-start gap-3">
                  <FiCheckCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-800"
                  />
                  <p className="text-sm leading-6 text-stone-600">
                    Questions about products and categories
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheckCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-800"
                  />
                  <p className="text-sm leading-6 text-stone-600">
                    Order-related enquiries and feedback
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheckCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-800"
                  />
                  <p className="text-sm leading-6 text-stone-600">
                    Ideas to help us improve Furnispace
                  </p>
                </div>
              </div>

              <div className="mt-9 rounded-2xl bg-white/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#193c32] text-white">
                    <FiMapPin size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-900">
                      Furnispace
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      Furniture for comfortable living
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="p-5 sm:p-8 lg:p-10">
            <div className="mb-7">
              <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                Send us a message
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Fields marked with * are required.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-semibold text-stone-700"
                  >
                    Your name *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                    className={`${inputClass} ${
                      errors.name ? "border-red-400 focus:border-red-500" : ""
                    }`}
                  />
                  {errors.name && (
                    <p id="contact-name-error" className="mt-1.5 text-xs text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-sm font-semibold text-stone-700"
                  >
                    Email address *
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                    className={`${inputClass} ${
                      errors.email ? "border-red-400 focus:border-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p id="contact-email-error" className="mt-1.5 text-xs text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-sm font-semibold text-stone-700"
                >
                  What is your message about?
                </label>
                <select
                  id="contact-subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option>General enquiry</option>
                  <option>Product enquiry</option>
                  <option>Order support</option>
                  <option>Feedback or suggestion</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-semibold text-stone-700"
                >
                  Your message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  maxLength={3000}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={
                    errors.message ? "contact-message-error" : "contact-message-count"
                  }
                  className={`${inputClass} resize-y`}
                />
                <div className="mt-2 flex items-start justify-between gap-3">
                  {errors.message ? (
                    <p id="contact-message-error" className="text-xs text-red-600">
                      {errors.message}
                    </p>
                  ) : (
                    <p id="contact-message-count" className="text-xs text-stone-400">
                      Minimum 10 characters
                    </p>
                  )}
                  <span className="shrink-0 text-xs text-stone-400">
                    {form.message.length}/3000
                  </span>
                </div>
              </div>

              {readyToEmail && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
                >
                  <FiCheckCircle className="mt-0.5 shrink-0" size={17} />
                  Your email application should open with the message prepared.
                  Send it from there to complete delivery.
                </div>
              )}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#193c32] px-6 py-4 text-sm font-bold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-800/20 sm:w-auto"
              >
                <FiSend size={17} />
                Prepare email
                <FiArrowRight size={17} />
              </button>

              <p className="text-xs leading-5 text-stone-400">
                This form opens your email application; it does not send
                messages silently from the website. If no email application
                opens, write directly to{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="break-all font-semibold text-emerald-800 underline underline-offset-2"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
