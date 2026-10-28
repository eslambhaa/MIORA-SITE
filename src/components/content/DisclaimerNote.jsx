import { Link } from 'react-router'

export default function DisclaimerNote({ children, className = 'mt-12' }) {
  return (
    <div role="note" className={`${className} flex items-start gap-5 rounded-(--radius-page-card) bg-(--color-page-card) p-7 shadow-(--shadow-page-card)`}>
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="26" height="29" viewBox="0 0 17.9125 20" fill="none" stroke="currentColor" strokeWidth="1.34344" strokeLinecap="round" strokeLinejoin="round" className="mt-2 shrink-0 text-(color:--color-page-primary)">
        <path d="M8.95625 17.4635C8.95625 17.4635 14.9271 14.4781 14.9271 10V4.77552L8.95625 2.53646L2.98542 4.77552V10C2.98542 14.4781 8.95625 17.4635 8.95625 17.4635Z" />
        <path d="M6.71719 10L8.2099 11.4927L11.1953 8.50729" />
      </svg>
      <p className="text-lg leading-9 md:text-xl md:leading-10">
        {children}{' '}
        <Link to="/help" className="font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
          متى أطلب دعمًا متخصصًا؟
        </Link>
      </p>
    </div>
  )
}
