export default function AuthCard({ title, subtitle, children }) {
  return (
    <main className="flex-1">
      <section className="-mt-[112px] flex min-h-[688px] items-center justify-center bg-(image:--gradient-page-auth) bg-no-repeat px-5 pt-[152px] pb-10">
        <div className="w-full max-w-[470px] rounded-[25px] border border-(--color-page-border) bg-(--color-page-surface) p-6 shadow-(--shadow-page-auth) sm:p-[38px]">
          <p className="flex items-start gap-[19px] pb-[18px] text-xl leading-[35px] font-bold text-(color:--color-page-button)">
            <span aria-hidden="true" className="mt-2 size-[7px] rounded-full bg-(--color-page-button)" />
            ميورا
          </p>
          <h1 className="text-center text-[30px] leading-[45.5px] tracking-[-0.02em] sm:text-[35px]">{title}</h1>
          {subtitle && <p className="mt-1 text-center text-lg leading-7 tracking-[-0.035em] sm:text-[19px]">{subtitle}</p>}
          {children}
        </div>
      </section>
    </main>
  )
}
