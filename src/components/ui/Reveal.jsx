import { useEffect, useRef, useState } from 'react'

// Fade-up on scroll, once. One shared IntersectionObserver for the whole page.
// Delays are fixed classes (no inline styles, so the CSP stays strict).
const delays = [
  '[--reveal-delay:0ms]',
  '[--reveal-delay:80ms]',
  '[--reveal-delay:160ms]',
  '[--reveal-delay:240ms]',
  '[--reveal-delay:320ms]',
  '[--reveal-delay:400ms]',
  '[--reveal-delay:480ms]',
  '[--reveal-delay:560ms]',
]

let observer = null
const onShow = new WeakMap()

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        onShow.get(entry.target)?.()
        observer.unobserve(entry.target)
        onShow.delete(entry.target)
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  )
  return observer
}

export default function Reveal({ as: Tag = 'div', index = 0, className = '', children, ...props }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    if (!('IntersectionObserver' in window)) {
      setShown(true)
      return undefined
    }
    const watcher = getObserver()
    onShow.set(element, () => setShown(true))
    watcher.observe(element)
    return () => {
      watcher.unobserve(element)
      onShow.delete(element)
    }
  }, [])

  return (
    <Tag ref={ref} data-shown={shown || undefined} className={`reveal ${delays[Math.min(index, delays.length - 1)]} ${className}`} {...props}>
      {children}
    </Tag>
  )
}
