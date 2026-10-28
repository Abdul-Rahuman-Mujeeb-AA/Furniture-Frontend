import { FiHome } from "react-icons/fi";

function Loader({ message = "Preparing your space..." }) {
  return (
    <div
      className="flex min-h-[50vh] w-full items-center justify-center px-4 py-12 sm:min-h-[55vh] sm:px-6 lg:min-h-[60vh]"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-stone-200/80 bg-white px-6 py-10 text-center shadow-[0_15px_50px_rgba(23,59,43,0.06)] sm:px-10 sm:py-12">
        {/* Animated brand icon */}
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-stone-200 border-t-emerald-900" />

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl rounded-bl-sm bg-emerald-950 text-2xl text-white shadow-md">
            <FiHome />
          </div>

          <span className="absolute -right-0.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-amber-600" />
        </div>

        {/* Brand */}
        <h2 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
          furni<span className="text-amber-700">space</span>
        </h2>

        <p className="mt-3 max-w-xs text-sm leading-6 text-stone-500 sm:text-base">
          {message}
        </p>

        {/* Loading indicator */}
        <div className="mt-7 flex items-center gap-2" aria-hidden="true">
          <span className="h-1.5 w-8 animate-pulse rounded-full bg-emerald-950" />
          <span className="h-1.5 w-5 animate-pulse rounded-full bg-amber-600 [animation-delay:150ms]" />
          <span className="h-1.5 w-3 animate-pulse rounded-full bg-stone-300 [animation-delay:300ms]" />
        </div>

        <span className="sr-only">Loading, please wait.</span>
      </div>
    </div>
  );
}

export default Loader;
