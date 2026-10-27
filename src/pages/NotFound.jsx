import { Link } from 'react-router'

export default function NotFound() {
  return (
    <>
      <title>الصفحة غير موجودة | ميورا</title>
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <h1 className="text-4xl leading-[1.3]">الصفحة غير موجودة</h1>
        <p className="max-w-xl text-lg leading-8 text-(color:--color-page-muted)">ربما تغيّر الرابط أو كُتب بشكل غير صحيح.</p>
        <Link to="/" className="text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
          العودة إلى الرئيسية
        </Link>
      </main>
    </>
  )
}
