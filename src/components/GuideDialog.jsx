import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { destinations } from '../data/destinations.js'

const itemBase =
  'flex min-h-14 w-full cursor-pointer items-center gap-[9px] rounded-[13px] border px-[11px] py-2 text-start text-base leading-7 outline-(--color-page-primary) transition-colors duration-200 motion-reduce:transition-none'
const itemIdle =
  'border-(--color-page-border) bg-(--color-page-bg) text-(color:--color-page-heading) hover:border-(--color-page-button)'
const itemSelected =
  'border-(--color-page-button) bg-(--color-page-guide-selected) text-(color:--color-page-primary)'

export default function GuideDialog({ open, onClose }) {
  const dialogRef = useRef(null)
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState('home')
  const selected = destinations.find((item) => item.id === selectedId)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  function go(to) {
    onClose()
    navigate(to)
  }

  function choose(item) {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setSelectedId(item.id)
    } else {
      go(item.to)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="guide-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(1100px,calc(100%-2rem))] overflow-y-auto rounded-[26px] border border-(--color-page-border) bg-(--color-page-surface) p-5 text-(color:--color-page-heading) shadow-(--shadow-page-guide) backdrop:bg-(--color-page-guide-backdrop) md:p-7"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">دليلك داخل ميورا</p>
          <h2 id="guide-title" className="text-[26px] leading-[39px] tracking-[-0.02em] md:text-[30px]">استكشف المنصة</h2>
        </div>
        <button
          type="button"
          aria-label="إغلاق"
          onClick={onClose}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-(--color-page-border) outline-(--color-page-primary)"
        >
          <img loading="lazy" src="/icons/guide/close.svg" alt="" width="20" height="20" />
        </button>
      </div>
      <div className="mt-2 grid gap-5 md:grid-cols-[minmax(0,1fr)_314px]">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {destinations.map((item) => {
            const isSelected = item.id === selectedId
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => choose(item)}
                  onDoubleClick={() => go(item.to)}
                  className={`${itemBase} ${isSelected ? itemSelected : itemIdle}`}
                >
                  <span className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-(--color-page-surface) drop-shadow-[0_4px_2px_rgb(0_0_0/0.25)]">
                    <img loading="lazy" src={`/icons/guide/${item.icon}.svg`} alt="" width="18" height="18" />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  <img loading="lazy" src="/icons/guide/chevron.svg" alt="" width="16" height="16" className="shrink-0 -scale-x-100" />
                </button>
              </li>
            )
          })}
        </ul>
        <section
          aria-live="polite"
          className="hidden flex-col items-start rounded-[20px] bg-(--color-page-guide-panel) p-7 md:flex"
        >
          <span className="grid size-[62px] place-items-center rounded-[18px] bg-white/12">
            {selected.id === 'home' ? (
              <img loading="lazy" src="/icons/guide/home-large.svg" alt="" width="30" height="30" />
            ) : (
              <img loading="lazy" src={`/icons/guide/${selected.icon}.svg`} alt="" width="30" height="30" className="size-[30px] brightness-0 invert" />
            )}
          </span>
          <p className="mt-5 text-[13px] leading-[22.75px] text-(color:--color-page-guide-panel-muted)">الوجهة المختارة</p>
          <h3 className="pt-1 pb-2 text-[28px] leading-[36.4px] tracking-[-0.02em] text-white">{selected.label}</h3>
          <p className="min-h-[68px] max-w-[229px] text-base leading-7 text-(color:--color-page-guide-panel-text)">{selected.description}</p>
          <button
            type="button"
            onClick={() => go(selected.to)}
            className="mt-auto inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-(--radius-page-button) border border-transparent bg-white px-[22px] py-2.5 text-base leading-7 font-bold text-(color:--color-page-guide-panel) shadow-(--shadow-page-button) outline-white"
          >
            افتح الصفحة
            <img loading="lazy" src="/icons/guide/arrow.svg" alt="" width="18" height="18" className="-scale-x-100" />
          </button>
        </section>
      </div>
    </dialog>
  )
}
