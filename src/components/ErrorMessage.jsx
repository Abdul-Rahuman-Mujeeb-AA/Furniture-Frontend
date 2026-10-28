import { FiAlertCircle, FiRefreshCw, FiWifiOff } from "react-icons/fi";

function ErrorMessage({
  message = "Something went wrong. Please try again.",
  onRetry,
  title = "We hit a little snag",
  type = "error",
}) {
  const isNetworkError = type === "network";

  return (
    <div
      className="flex w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      role="alert"
      aria-live="assertive"
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-red-100 bg-white shadow-[0_15px_50px_rgba(23,59,43,0.06)] sm:rounded-3xl">
        {/* Decorative background */}
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-red-50 sm:h-44 sm:w-44" />
        <div className="absolute right-10 top-12 h-12 w-12 rounded-full border border-red-100 sm:right-16 sm:top-16 sm:h-16 sm:w-16" />

        <div className="relative px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          {/* Error icon */}
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-600 ring-1 ring-red-100 sm:h-16 sm:w-16 sm:text-3xl">
            {isNetworkError ? <FiWifiOff /> : <FiAlertCircle />}
          </div>

          {/* Error content */}
          <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-700 sm:text-xs">
            {isNetworkError ? "Connection issue" : "Something went wrong"}
          </span>

          <h2 className="mt-4 text-xl font-bold tracking-tight text-emerald-950 sm:text-2xl lg:text-3xl">
            {title}
          </h2>

          <p className="mt-3 max-w-md -wrap-break-words text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
            {message}
          </p>

          {/* Actions */}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 active:translate-y-0 sm:w-auto"
            >
              <FiRefreshCw className="text-base" />
              Try Again
            </button>
          )}

          <div className="mt-7 border-t border-stone-100 pt-5">
            <p className="text-xs leading-5 text-stone-400 sm:text-sm">
              Furnispace Support · If the problem continues, please try again
              later.
            </p>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-1 w-full bg-linear-to-r from-emerald-950 via-amber-600 to-red-400" />
      </div>
    </div>
  );
}

export default ErrorMessage;
