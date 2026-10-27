export default function Placeholder() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-(--color-page-bg) px-4 text-center text-(color:--color-page-heading)">
      <img src="/logo.png" alt="ميورا" width="96" height="96" className="size-24" />
      <h1 className="text-3xl font-bold">ميورا</h1>
      <p className="max-w-md text-base leading-7 text-(color:--color-page-muted)">
        إعداد المشروع جاهز. الصفحات تُبنى مرحلة بمرحلة.
      </p>
    </main>
  )
}
