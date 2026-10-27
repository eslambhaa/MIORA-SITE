import { useEffect, useState } from 'react'

const STORAGE_KEY = 'miora-splash-seen'
const VISIBLE_MS = 1200
const FADE_MS = 400

function alreadySeen() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    return
  }
}

export default function SplashScreen() {
  const [stage, setStage] = useState(() => (alreadySeen() ? 'done' : 'visible'))

  useEffect(() => {
    if (stage === 'done') return
    markSeen()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fadeTimer = setTimeout(() => setStage('fading'), reduceMotion ? 600 : VISIBLE_MS)
    const doneTimer = setTimeout(() => setStage('done'), reduceMotion ? 600 : VISIBLE_MS + FADE_MS)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  if (stage === 'done') return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-(--color-page-button) transition-opacity duration-400 motion-reduce:transition-none ${stage === 'fading' ? 'opacity-0' : 'opacity-100'}`}
    >
      <img src="/images/splash-logo.webp" alt="" width="482" height="482" className="size-[min(482px,70vw)]" />
    </div>
  )
}
