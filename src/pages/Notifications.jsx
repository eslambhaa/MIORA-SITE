import { Link } from 'react-router'
import NotificationItem from '../components/notifications/NotificationItem.jsx'
import { markAllRead, useNotifications } from '../lib/notifications.js'

const number = new Intl.NumberFormat('ar-EG')

export default function Notifications() {
  const { items, unread, status, signedIn } = useNotifications()

  return (
    <>
      <title>الإشعارات | ميورا</title>
      <meta name="description" content="إشعارات ميورا: جديد الموقع، وتذكيرات تسجيل الشعور، وملخصك الأسبوعي." />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[40px] text-center md:pb-[60px]">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">ميورا</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">الإشعارات</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">
            جديد الموقع، وتذكيرات هادئة بتسجيل شعورك، وملخصك الأسبوعي.
          </p>
        </section>
        <section aria-label="قائمة الإشعارات" className="px-6 pb-[105px]">
          <div className="mx-auto max-w-[760px]">
            {!signedIn && (
              <p className="mb-6 rounded-2xl bg-(--color-page-card) p-5 text-base leading-7 text-(color:--color-page-muted)">
                تظهر لك هنا أخبار الموقع. لتصلك تذكيرات يومية بتسجيل شعورك وملخص أسبوعي،{' '}
                <Link to="/login?next=/notifications" className="font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
                  سجّل الدخول
                </Link>
                .
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
              <p role="status" className="text-base leading-7 text-(color:--color-page-muted)">
                {status === 'loading' && items.length === 0 ? 'جارٍ التحميل…' : unread ? `${number.format(unread)} غير مقروءة` : 'كلها مقروءة'}
              </p>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button type="button" onClick={markAllRead} className="min-h-11 cursor-pointer rounded-(--radius-page-button) border border-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-primary) outline-(--color-page-primary)">
                    تعليم الكل كمقروء
                  </button>
                )}
                {signedIn && (
                  <Link to="/profile#notifications" className="grid min-h-11 place-items-center rounded-(--radius-page-button) px-5 text-base font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
                    إعدادات الإشعارات
                  </Link>
                )}
              </div>
            </div>
            {status === 'error' && items.length === 0 && <p role="status" className="py-10 text-center text-lg text-(color:--color-page-muted)">تعذّر تحميل الإشعارات الآن. حاول مرة أخرى بعد قليل.</p>}
            {status === 'ready' && items.length === 0 && <p className="rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface) px-6 py-14 text-center text-lg text-(color:--color-page-muted)">لا توجد إشعارات حاليًا.</p>}
            {items.length > 0 && (
              <ul className="rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface) p-2">
                {items.map((item) => (
                  <NotificationItem key={item.key} item={item} canDelete />
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
