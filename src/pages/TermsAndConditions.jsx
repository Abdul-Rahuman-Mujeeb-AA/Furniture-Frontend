import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiCheckCircle,
  FiClipboard,
  FiCreditCard,
  FiFileText,
  FiLock,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiShield,
  FiTruck,
  FiUser,
} from "react-icons/fi";

const termsSections = [
  {
    id: "eligibility",
    number: "01",
    icon: FiUser,
    title: "Eligibility and Accounts",
    intro:
      "Some Furnispace features require you to create an account before shopping or placing orders.",
    points: [
      "Provide accurate information when registering and updating your profile.",
      "Keep your login credentials private and notify us if you suspect unauthorised account access.",
      "You are responsible for activity carried out through your account, subject to applicable law.",
      "Administrative features are restricted to authorised administrators.",
    ],
  },
  {
    id: "products",
    number: "02",
    icon: FiPackage,
    title: "Product Information",
    intro:
      "Furnispace displays furniture products and related details to help customers make informed choices.",
    points: [
      "Product descriptions, dimensions, materials, colours, images, and prices should be reviewed before ordering.",
      "Colours and finishes may appear slightly different depending on your screen and lighting.",
      "Product availability and displayed stock may change.",
      "If a listing contains an error or important information is unavailable, we may need to clarify or correct it before fulfilling an order.",
    ],
  },
  {
    id: "pricing",
    number: "03",
    icon: FiCreditCard,
    title: "Prices and Payments",
    intro:
      "Prices, discounts, delivery charges, and payment methods are presented during the shopping process.",
    points: [
      "Review the final order total before confirming your purchase.",
      "Delivery charges, applicable taxes, and discounts should be displayed where relevant.",
      "Available payment methods depend on the options actually enabled on the website.",
      "An online payment option should not be treated as a completed payment gateway unless a supported provider has been integrated.",
    ],
  },
  {
    id: "orders",
    number: "04",
    icon: FiShoppingBag,
    title: "Orders and Acceptance",
    intro:
      "Submitting an order is a request to purchase the selected products under the terms displayed at checkout.",
    points: [
      "Check product selections, quantities, delivery details, and payment method before submitting an order.",
      "An order confirmation does not necessarily mean dispatch has occurred.",
      "Orders may require review if stock, pricing, delivery details, or payment information needs verification.",
      "If an order cannot be fulfilled, the customer should be informed and any applicable refund handled according to law and the payment provider's process.",
    ],
  },
  {
    id: "delivery",
    number: "05",
    icon: FiTruck,
    title: "Shipping and Delivery",
    intro:
      "Delivery arrangements depend on the delivery information and options available at checkout.",
    points: [
      "Provide a complete delivery address and a reachable contact number.",
      "Estimated delivery times are indicative unless expressly confirmed as guaranteed.",
      "Delivery may be affected by location, availability, logistics, weather, or other circumstances outside reasonable control.",
      "Any delivery charges and applicable delivery restrictions should be checked before placing an order.",
    ],
  },
  {
    id: "cancellations",
    number: "06",
    icon: FiRefreshCw,
    title: "Cancellations, Returns and Refunds",
    intro:
      "Cancellation, return, replacement, and refund requests are handled according to the store's actual policies and applicable consumer-protection requirements.",
    points: [
      "Use the available order-management features or contact the store to request cancellation.",
      "A cancellation request may not be possible after an order has entered a later fulfilment stage.",
      "Return eligibility, timelines, product condition requirements, and refund processing should be confirmed with the store before returning an item.",
      "Nothing in these terms is intended to remove consumer rights that cannot legally be excluded.",
    ],
  },
  {
    id: "use",
    number: "07",
    icon: FiShield,
    title: "Acceptable Use",
    intro:
      "Customers must use Furnispace responsibly and must not interfere with the website or other users.",
    points: [
      "Do not attempt unauthorised access to accounts, admin pages, or backend services.",
      "Do not submit fraudulent orders or deliberately provide misleading information.",
      "Do not upload unlawful, malicious, or unauthorised content.",
      "Do not disrupt the service, misuse personal information, or attempt to bypass security controls.",
    ],
  },
  {
    id: "reviews",
    number: "08",
    icon: FiClipboard,
    title: "Reviews and User Content",
    intro:
      "Where product reviews or other customer content are supported, users are responsible for what they submit.",
    points: [
      "Submit genuine feedback based on your experience.",
      "Do not post abusive, unlawful, misleading, or unrelated content.",
      "Do not publish another person's private information without permission.",
      "Content moderation and removal should be handled consistently with applicable law and the store's policies.",
    ],
  },
  {
    id: "privacy",
    number: "09",
    icon: FiLock,
    title: "Privacy and Personal Information",
    intro:
      "Your use of Furnispace is also subject to the website's Privacy Policy.",
    points: [
      "Personal information may be used to operate accounts, manage orders, arrange delivery, and respond to enquiries.",
      "Information should be handled in accordance with the published Privacy Policy and applicable law.",
      "Read the Privacy Policy to understand the intended handling of account and shopping information.",
    ],
  },
  {
    id: "liability",
    number: "10",
    icon: FiFileText,
    title: "Changes and General Conditions",
    intro:
      "These terms provide a general framework for using the Furnispace website.",
    points: [
      "Website features, product listings, and available services may change over time.",
      "Terms may be updated when the project or its business practices change. Material changes should be communicated where required.",
      "Nothing here excludes liability or rights that cannot be excluded under applicable law.",
      "Any disputes should be handled under applicable law and through the appropriate legal process.",
    ],
  },
];

export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-[#faf9f6] text-stone-800">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#193c32] text-white">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border border-white/10 sm:h-104 sm:w-104" />
        <div className="absolute -right-8 -top-12 h-56 w-56 rounded-full border border-white/10 sm:h-72 sm:w-72" />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-100 transition hover:text-white"
          >
            <FiArrowLeft size={16} />
            Back to home
          </Link>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
            <FiFileText size={15} />
            Furnispace · Terms of use
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Clear terms for{" "}
            <span className="font-serif italic text-[#d8e7c3]">
              better living.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/80 sm:text-base sm:leading-8">
            These terms describe the basic conditions for browsing furniture,
            managing an account, placing orders, and using the features
            available on the Furnispace online store.
          </p>

          <div className="mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: FiShoppingBag, label: "Shopping responsibly" },
              { icon: FiPackage, label: "Order information" },
              { icon: FiShield, label: "Fair use" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] p-4"
              >
                <Icon size={19} className="shrink-0 text-[#d8e7c3]" />
                <span className="text-sm font-medium text-emerald-50">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto grid max-w-7xl items-start gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-12 lg:px-10">
        {/* Contents navigation */}
        <aside className="lg:sticky lg:top-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
              Quick navigation
            </p>

            <nav
              aria-label="Terms and conditions sections"
              className="mt-4 space-y-1"
            >
              {termsSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-600 transition hover:bg-[#eef2e9] hover:text-emerald-900"
                >
                  <span className="w-6 shrink-0 text-xs font-semibold text-stone-400 group-hover:text-emerald-800">
                    {section.number}
                  </span>
                  <span>{section.title}</span>
                </a>
              ))}
            </nav>

            <div className="mt-6 rounded-xl bg-[#eef2e9] p-4">
              <FiCheckCircle size={20} className="text-emerald-900" />
              <h2 className="mt-3 text-sm font-bold text-stone-900">
                Before you order
              </h2>
              <p className="mt-2 text-xs leading-5 text-stone-600">
                Check product details, delivery charges, address, and final
                order total before confirming.
              </p>
              <Link
                to="/products"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-900 hover:text-emerald-700"
              >
                Browse furniture
                <FiArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </aside>

        {/* Article */}
        <article className="min-w-0">
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e7efdf] text-emerald-900">
                <FiCheckCircle size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  Welcome to Furnispace
                </h2>
                <p className="mt-2 text-sm leading-7 text-stone-600">
                  By accessing or using Furnispace, you agree to follow these
                  terms to the extent permitted by applicable law. If you do not
                  agree, please discontinue use of the website. These terms are
                  a project-specific starting point and should be reviewed
                  against the store's actual features and operating policies
                  before publication.
                </p>
              </div>
            </div>
          </section>

          <div className="mt-5 space-y-5">
            {termsSections.map((section) => {
              const Icon = section.icon;

              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-6 rounded-2xl border border-stone-200 bg-white p-5 sm:p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e7efdf] text-emerald-900">
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold tracking-widest text-emerald-800">
                          {section.number}
                        </span>
                        <h2 className="text-lg font-bold text-stone-900 sm:text-xl">
                          {section.title}
                        </h2>
                      </div>

                      <p className="mt-3 text-sm leading-7 text-stone-600">
                        {section.intro}
                      </p>

                      <ul className="mt-4 space-y-3">
                        {section.points.map((point) => (
                          <li
                            key={point}
                            className="flex items-start gap-3 text-sm leading-6 text-stone-600"
                          >
                            <FiCheckCircle
                              size={17}
                              className="mt-0.5 shrink-0 text-emerald-800"
                            />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          {/* Footer callout */}
          <section className="mt-5 rounded-2xl bg-[#193c32] p-6 text-white sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
              Questions about these terms?
            </p>

            <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  Contact the Furnispace team.
                </h2>
                <p className="mt-2 text-sm leading-6 text-emerald-50/75">
                  Reach out if you need clarification about shopping or using
                  the website.
                </p>
              </div>

              <Link
                to="/contact"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#d8e7c3] px-5 py-3.5 text-sm font-bold text-[#193c32] transition hover:bg-white"
              >
                Contact us
                <FiArrowUpRight size={17} />
              </Link>
            </div>
          </section>

          <p className="mt-6 text-xs leading-6 text-stone-500">
            Legal notice: This is a general terms template for the Furnispace
            project, not legal advice. Before publishing, confirm your actual
            cancellation and return policy, delivery commitments, payment
            methods, business details, and applicable consumer-law requirements.
          </p>
        </article>
      </div>
    </main>
  );
}