import { Link } from 'react-router'

const footerLink =
  'block py-[5px] text-base leading-7 text-(color:--color-page-footer-text) transition-colors duration-200 hover:text-(color:--color-page-footer-heading) outline-(--color-page-footer-heading) motion-reduce:transition-none'

const columns = [
  {
    title: 'استكشف',
    links: [
      { to: '/content', label: 'المحتوى التوعوي' },
      { to: '/relaxation', label: 'تمارين الاسترخاء' },
      { to: '/assessment', label: 'التقييمات الذاتية' },
    ],
  },
  {
    title: 'عن ميورا',
    links: [
      { to: '/about', label: 'عن المنصة' },
      { to: '/help', label: 'المساعدة والأسئلة' },
      { to: '/contact', label: 'تواصل معنا' },
    ],
  },
  {
    title: 'الخصوصية',
    links: [
      { to: '/privacy', label: 'سياسة الخصوصية' },
      { to: '/terms', label: 'شروط الاستخدام' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-(--color-page-footer-bg) px-6 pt-[70px] pb-5 lg:px-[70px]">
      <div className="mx-auto max-w-[1026px]">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-[minmax(0,294fr)_repeat(3,minmax(0,184fr))] md:gap-x-8 lg:gap-x-[60px]">
          <div>
            <p className="pt-1 text-xl leading-[35px] font-bold text-(color:--color-page-footer-heading)">ميورا</p>
            <p className="mt-3 max-w-[265px] text-base leading-7 text-(color:--color-page-footer-text)">
              مساحة تعليمية داعمة تساعدك على فهم مشاعرك وبناء عادات أكثر توازنًا، خطوة بخطوة.
            </p>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-base leading-7 font-bold text-(color:--color-page-footer-heading)">{column.title}</h2>
              <ul className="mt-[15px] flex flex-col items-start">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={footerLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-[50px] flex flex-col gap-2 border-t border-(--color-page-footer-divider) pt-5 text-[13px] leading-[22.75px] text-(color:--color-page-footer-legal) sm:flex-row sm:justify-between">
          <p>ميورا لا تحلّ محلّ التشخيص أو العلاج المتخصص.</p>
          <p>مشروع تخرج.ميورا.2026 ©</p>
        </div>
      </div>
    </footer>
  )
}
