// Loading screen while a page's code or the session is loading.
// It fades in only after 250ms, so fast loads never flash it.
// The same markup (static) is in index.html until the app starts.
export default function PageLoader({ label = 'جارٍ التحميل…' }) {
  return (
    <main aria-busy="true" className="flex min-h-[60vh] flex-1 items-center justify-center px-6 py-24">
      <div role="status" className="flex animate-loader-in flex-col items-center gap-5">
        <span className="relative grid size-[88px] place-items-center">
          <span aria-hidden="true" className="absolute inset-0 animate-loader-ring rounded-full border-2 border-(--color-page-button) motion-reduce:animate-none" />
          <span className="grid size-[72px] place-items-center rounded-full bg-(--color-page-surface) shadow-(--shadow-home-soft)">
            <img src="/images/logo-header.webp" alt="" width="48" height="48" className="size-12" />
          </span>
        </span>
        <span className="text-base leading-7 text-(color:--color-page-muted)">{label}</span>
      </div>
    </main>
  )
}
