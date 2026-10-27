import { Link } from 'react-router'
import { reflectionTools } from '../../data/tools.js'
import Reveal from '../ui/Reveal.jsx'
import SectionTitle from './SectionTitle.jsx'

export default function ReflectionTools() {
  return (
    <section aria-labelledby="tools-title" className="slide px-6 pt-[105px] pb-[82px]">
      <div className="mx-auto max-w-[1026px]">
        <SectionTitle
          id="tools-title"
          eyebrow="مساحة للتأمل"
          title="اكتشف نفسك بشكل أفضل"
          description="أسئلة بسيطة تساعدك على فهم مشاعرك وعاداتك بشكل أوضح، وتمنحك مساحة للتأمل واكتشاف خطوات مناسبة لك."
        />
        <ul className="mt-[42px] grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {reflectionTools.map((tool, index) => (
            <Reveal as="li" key={tool.id} index={index + 1}>
              <article className="flex h-full min-h-[340px] flex-col items-start rounded-[22px] border border-(--color-page-border) bg-(--color-page-surface) p-[26px]">
                <span className={`grid size-[58px] place-items-center rounded-[17px] ${tool.tint}`}>
                  <img src={`/icons/home/${tool.icon}.svg`} alt="" width="28" height="28" />
                </span>
                <p className="pt-4 text-[12.8px] leading-[22.4px] text-(color:--color-page-muted)">أداة تأملية · من ٣ إلى ٥ دقائق</p>
                <h3 className="pt-4 text-[21px] leading-[27.3px] tracking-[-0.02em]">{tool.title}</h3>
                <p className="pt-2 text-base leading-7 text-(color:--color-page-muted)">{tool.description}</p>
                <Link
                  to={`/assessment?topic=${tool.id}`}
                  className="mt-auto inline-flex min-h-12 items-center gap-2.5 rounded-(--radius-page-button) border border-(--color-page-border) px-[22px] py-2.5 text-base leading-7 font-bold text-(color:--color-page-primary) outline-(--color-page-primary) transition-colors duration-200 hover:border-(--color-page-button) motion-reduce:transition-none"
                >
                  ابدأ التقييم
                  <span className="sr-only">: {tool.title}</span>
                  <img src="/icons/home/tool-arrow.svg" alt="" width="18" height="18" className="-scale-x-100" />
                </Link>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
