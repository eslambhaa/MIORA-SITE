export default function HomeHero({ onExplore }) {
  return (
    <section className="story story-220 -mt-[112px] overflow-x-clip bg-(image:--gradient-home-hero) px-6 pt-[160px] pb-20 md:min-h-[780px] md:pt-[180px]">
      <div className="story__pin relative">
      <div className="mx-auto grid w-full max-w-[1026px] items-center gap-14 md:grid-cols-[minmax(0,502px)_minmax(0,454px)] md:justify-between">
        <div>
          <p className="pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">مساحة هادئة. خطوة حقيقية.</p>
          <h1 className="max-w-[394px] text-[40px] leading-[1.3] font-bold tracking-[-0.02em] md:text-[58.32px]">مساحة آمنة تبدأ منها رحلة فهم نفسك</h1>
          <p className="step-up [--from:2%] [--to:16%] max-w-[500px] pt-6 text-lg leading-[34px] text-(color:--color-page-muted) md:text-xl md:leading-[38px]">
            افهم مشاعرك، اكتشف طرقًا صحية للتعامل مع الضغوط، وخد خطوات صغيرة نحو حياة أكثر توازنًا.
          </p>
          <div className="step-up [--from:8%] [--to:22%] pt-8">
            <button
              type="button"
              onClick={onExplore}
              className="inline-flex min-h-[49.6px] cursor-pointer items-center gap-2.5 rounded-(--radius-page-button) border border-transparent bg-(--color-page-button) px-[22px] py-2.5 text-base leading-7 font-bold text-(color:--color-page-surface) shadow-(--shadow-home-soft) outline-(--color-page-primary) transition-opacity duration-200 hover:opacity-90 motion-reduce:transition-none"
            >
              استكشف المنصة
              <img src="/icons/home/arrow.svg" alt="" width="18" height="18" className="-scale-x-100" />
            </button>
          </div>
        </div>
        <div className="relative mx-auto aspect-[454/510] w-full max-w-[454px]">
          <div aria-hidden="true" className="step-pop [--from:16%] [--to:36%] absolute inset-0">
            <div aria-hidden="true" className="absolute top-[-2.7%] left-[-3.5%] h-[92%] w-[91%] rotate-4 animate-hero-arch rounded-t-[47%] rounded-b-[22%] border border-(--color-home-arch)" />
          </div>
          <div className="step-rise [--from:26%] [--to:52%] absolute inset-0">
          <img
            src="/images/home/hero-morning-window.webp"
            alt="ضوء صباح هادئ بجوار نافذة وكوب دافئ"
            width="860"
            height="1290"
            fetchPriority="high"
            className="absolute right-0 bottom-0 h-[95.3%] w-[94.7%] animate-hero-image rounded-t-[51%] rounded-b-[23%] object-cover shadow-(--shadow-page-guide)"
          />
          </div>
          <div className="step-left [--from:48%] [--to:62%] absolute inset-0">
          <div className="absolute top-[0.6%] left-[-4.4%] flex size-[100px] flex-col items-center justify-center gap-1 rounded-full bg-(--color-page-guide-selected) text-center animate-hero-float drop-shadow-[0_8px_12px_rgb(31_43_82/0.07)] sm:size-[130px]">
            <img src="/icons/home/breath.svg" alt="" width="28" height="28" />
            <span className="px-2 text-[13px] leading-[22.75px] text-(color:--color-page-primary)">خد نفسًا هادئًا</span>
          </div>
          </div>
          <div className="step-right [--from:58%] [--to:72%] absolute inset-0">
          <div className="absolute top-[77.6%] right-0 flex items-center gap-3 rounded-2xl bg-white/70 animate-hero-float-late px-[18px] py-[15px] shadow-(--shadow-page-guide) backdrop-blur-[30px] md:right-[-9%]">
            <span aria-hidden="true" className="size-3 shrink-0 rounded-full bg-(--color-home-green) shadow-[0_0_0_7px_rgb(34_197_94/0.3)] animate-pulse-dot" />
            <span className="flex flex-col">
              <span className="text-base leading-7 font-bold">لحظة لنفسك</span>
              <span className="text-[12.8px] leading-[22.4px] text-(color:--color-page-muted)">ابدأ بما تشعر به الآن</span>
            </span>
          </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="scroll-cue step-out [--from:0%] [--to:6%] absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-sm leading-6 text-(color:--color-page-muted)">
        مرّر لاكتشاف ميورا
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce motion-reduce:animate-none"><path d="M5 7.5L10 12.5L15 7.5" /></svg>
      </div>
      </div>
    </section>
  )
}
