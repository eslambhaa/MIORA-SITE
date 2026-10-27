import Reveal from '../ui/Reveal.jsx'

export default function SectionTitle({ eyebrow, title, description, id, className = '' }) {
  return (
    <Reveal className={`max-w-[700px] ${className}`}>
      {eyebrow && <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">{eyebrow}</p>}
      <h2 id={id} className="text-[32px] leading-[1.3] tracking-[-0.02em] md:text-[46px]">
        {title}
      </h2>
      {description && <p className="pt-[14px] text-lg leading-[31.5px] text-(color:--color-page-muted)">{description}</p>}
    </Reveal>
  )
}
