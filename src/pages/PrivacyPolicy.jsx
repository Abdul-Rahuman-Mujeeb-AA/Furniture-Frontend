import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiCheckCircle,
  FiEye,
  FiFileText,
  FiLock,
  FiMail,
  FiShield,
  FiUser,
} from "react-icons/fi";

const privacySections = [
  {
    id: "information",
    number: "01",
    title: "Information We Collect",
    icon: FiUser,
    content:
      "When you create an account or use Furnispace, we may collect information such as your name, email address, contact details, delivery address, and account information. We also process the product, cart, and order details needed to provide our furniture shopping services.",
    points: [
      "Account and contact information you provide.",
      "Delivery details and order history.",
      "Product preferences and information you submit through forms.",
    ],
  },
  {
    id: "account",
    number: "02",
    title: "Your Account",
    icon: FiShield,
    content:
      "Your account allows you to access shopping features, manage your profile, and view your orders. You are responsible for keeping your login credentials confidential and for notifying us if you suspect unauthorized access to your account.",
    points: [
      "Provide accurate registration information.",
      "Keep your password private.",
      "Sign out when using a shared device.",
    ],
  },
  {
    id: "orders",
    number: "03",
    title: "Orders and Payments",
    icon: FiFileText,
    content:
      "We use order information to process purchases, manage deliveries, maintain order records, and provide customer support. Payment information is handled according to the payment method and services actually configured for the store. We do not claim to process payments through a third-party provider unless that service is enabled.",
    points: [
      "Maintain and display order records.",
      "Communicate about order status and delivery.",
      "Help resolve purchase-related questions.",
    ],
  },
  {
    id: "cookies",
    number: "04",
    title: "Cookies and Technical Data",
    icon: FiEye,
    content:
      "The application may use browser storage to maintain login sessions and remember necessary application state. Hosting providers and technical services may also process basic technical information to operate, secure, and troubleshoot the website. Any additional analytics or cookie-based services should be disclosed when implemented.",
    points: [
      "Authentication tokens may be stored in browser storage.",
      "Technical logs may be processed by hosting services.",
      "You can manage browser storage through your browser settings.",
    ],
  },
  {
    id: "sharing",
    number: "05",
    title: "How Information Is Used or Shared",
    icon: FiUser,
    content:
      "Information is used to operate Furnispace, manage accounts, fulfill orders, improve reliability, and respond to support requests. Information may be processed by service providers involved in hosting or operating the application, where applicable, or disclosed when required by law. We do not promise that no sharing occurs; it depends on the services configured for the project.",
    points: [
      "Operate the website and its shopping features.",
      "Provide support and communicate important updates.",
      "Maintain security and meet applicable legal obligations.",
    ],
  },
  {
    id: "security",
    number: "06",
    title: "Data Security and Retention",
    icon: FiLock,
    content:
      "We use reasonable measures appropriate to the application to help protect information. However, no website or electronic storage system can be guaranteed completely secure. Information may be retained for as long as necessary for account management, order records, legal obligations, and legitimate operational needs.",
    points: [
      "Use secure and unique account passwords.",
      "Restrict access to account credentials.",
      "Contact us if you notice suspicious account activity.",
    ],
  },
  {
    id: "rights",
    number: "07",
    title: "Your Choices and Rights",
    icon: FiCheckCircle,
    content:
      "Depending on applicable law, you may be entitled to request access to, correction of, or deletion of certain personal information. You can also contact us with privacy questions or requests. Some information may need to be retained where a legal or legitimate operational requirement applies.",
    points: [
      "Request corrections to inaccurate account details.",
      "Ask questions about how your information is handled.",
      "Request deletion where applicable and legally permitted.",
    ],
  },
  {
    id: "changes",
    number: "08",
    title: "Updates to This Policy",
    icon: FiFileText,
    content:
      "This Privacy Policy may be updated as Furnispace develops or as legal and operational requirements change. Updates will be reflected on this page with a revised effective date. You should review this page periodically to understand the policy that applies to your use of the website.",
    points: [
      "Review this page for policy changes.",
      "Check that your account information remains accurate.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#f7f6f1] text-[#203c31]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#193c32] px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-[#8ba17c]/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
          >
            <FiArrowLeft size={16} />
            Back to home
          </Link>

          <div className="grid items-end gap-8 md:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d4e0cc]">
                <FiShield size={15} />
                Your privacy matters
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Privacy, with
                <span className="block text-[#b9cbaa]">
                  transparency.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Learn how Furnispace handles account details, shopping
                information, and the data needed to provide a reliable
                furniture shopping experience.
              </p>
            </div>

            <div className="hidden h-32 w-32 items-center justify-center rounded-3xl border border-white/15 bg-white/5 md:flex">
              <FiLock className="text-[#c8d8bd]" size={48} strokeWidth={1.2} />
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/15 pt-6 text-xs text-white/60 sm:text-sm">
            <span className="flex items-center gap-2">
              <FiCheckCircle className="text-[#b9cbaa]" />
              Clear information
            </span>
            <span className="flex items-center gap-2">
              <FiCheckCircle className="text-[#b9cbaa]" />
              Account awareness
            </span>
            <span className="flex items-center gap-2">
              <FiCheckCircle className="text-[#b9cbaa]" />
              Responsible data handling
            </span>
          </div>
        </div>
      </section>

      {/* Policy content */}
      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
          {/* Contents navigation */}
          <aside className="h-fit rounded-2xl border border-[#e6e5dc] bg-white p-5 sm:p-6 lg:sticky lg:top-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#87917f]">
              On this page
            </p>

            <nav className="mt-5 space-y-1">
              {privacySections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="group flex items-start gap-3 rounded-xl px-3 py-3 text-sm text-[#657168] transition hover:bg-[#f1f4ed] hover:text-[#193c32]"
                >
                  <span className="pt-0.5 text-[10px] font-bold text-[#91a18a]">
                    {section.number}
                  </span>
                  <span>{section.title}</span>
                </a>
              ))}
            </nav>

            <div className="mt-6 rounded-xl bg-[#f2f4ed] p-4">
              <FiMail className="mb-3 text-[#476a50]" size={20} />
              <p className="text-sm font-semibold">Have a question?</p>
              <p className="mt-1 text-xs leading-5 text-[#6c776d]">
                Contact our team about privacy or your account information.
              </p>
              <Link
                to="/contact"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#315d43] hover:text-[#193c32]"
              >
                Contact us <FiArrowUpRight size={15} />
              </Link>
            </div>
          </aside>

          {/* Policy sections */}
          <div className="min-w-0">
            <div className="mb-6 rounded-2xl border border-[#e5e5dc] bg-white p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf2e9] text-[#416348]">
                  <FiFileText size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-bold sm:text-xl">
                    Privacy Policy
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#737b73]">
                    This page explains the general approach to privacy for
                    the Furnispace project. The final policy should reflect
                    the actual data collected and the services enabled in
                    your deployed application.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {privacySections.map((section) => {
                const SectionIcon = section.icon;

                return (
                  <article
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-6 rounded-2xl border border-[#e5e5dc] bg-white p-5 sm:p-7"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf2e9] text-[#416348]">
                        <SectionIcon size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-bold tracking-widest text-[#91a18a]">
                            {section.number}
                          </span>
                          <h2 className="text-lg font-bold sm:text-xl">
                            {section.title}
                          </h2>
                        </div>

                        <p className="mt-4 text-sm leading-7 text-[#68736a] sm:text-base">
                          {section.content}
                        </p>

                        <ul className="mt-5 space-y-3">
                          {section.points.map((point) => (
                            <li
                              key={point}
                              className="flex items-start gap-3 text-sm leading-6 text-[#526257]"
                            >
                              <FiCheckCircle
                                className="mt-1 shrink-0 text-[#78916f]"
                                size={16}
                              />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Contact callout */}
            <div className="mt-6 overflow-hidden rounded-2xl bg-[#193c32] p-6 text-white sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9cbaa]">
                    Need clarification?
                  </p>
                  <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                    We are here to help.
                  </h2>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-white/65">
                    Send us your privacy questions or let us know if your
                    account information needs attention.
                  </p>
                </div>

                <Link
                  to="/contact"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#dce6d3] px-5 py-3 text-sm font-semibold text-[#193c32] transition hover:bg-white"
                >
                  Contact Furnispace
                  <FiArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-[#e3e4dc] pt-6 text-sm text-[#788178] sm:flex-row sm:items-center sm:justify-between">
              <p>Furnispace · Thoughtful furniture for everyday living</p>
              <Link
                to="/terms-and-conditions"
                className="font-medium text-[#42654b] hover:text-[#193c32]"
              >
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}