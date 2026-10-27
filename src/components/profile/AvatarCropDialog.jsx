import { useEffect, useRef, useState } from 'react'
import { AVATAR_SIZE, encodeAvatar } from '../../lib/avatar.js'

const STEP = 12
const MAX_ZOOM = 3

// Crop before upload: drag (or arrow keys) to move, slider to zoom.
// The preview canvas is the final 256px picture, so what you see is what is saved.
export default function AvatarCropDialog({ bitmap, onCancel, onSave }) {
  const dialogRef = useRef(null)
  const canvasRef = useRef(null)
  const drag = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const base = bitmap ? AVATAR_SIZE / Math.min(bitmap.width, bitmap.height) : 1
  const scale = base * zoom

  function clamp(next, currentScale = scale) {
    if (!bitmap) return next
    const minX = AVATAR_SIZE - bitmap.width * currentScale
    const minY = AVATAR_SIZE - bitmap.height * currentScale
    return { x: Math.min(0, Math.max(minX, next.x)), y: Math.min(0, Math.max(minY, next.y)) }
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (bitmap) {
      const start = AVATAR_SIZE / Math.min(bitmap.width, bitmap.height)
      setZoom(1)
      setOffset({ x: (AVATAR_SIZE - bitmap.width * start) / 2, y: (AVATAR_SIZE - bitmap.height * start) / 2 })
      setSaving(false)
      setError('')
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [bitmap])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !bitmap) return
    const context = canvas.getContext('2d')
    context.imageSmoothingQuality = 'high'
    context.clearRect(0, 0, AVATAR_SIZE, AVATAR_SIZE)
    context.drawImage(bitmap, offset.x, offset.y, bitmap.width * scale, bitmap.height * scale)
  }, [bitmap, offset, scale])

  function changeZoom(value) {
    const next = Math.min(MAX_ZOOM, Math.max(1, value))
    const nextScale = base * next
    // Keep the point under the centre of the circle in place while zooming.
    const centreX = (AVATAR_SIZE / 2 - offset.x) / scale
    const centreY = (AVATAR_SIZE / 2 - offset.y) / scale
    setZoom(next)
    setOffset(clamp({ x: AVATAR_SIZE / 2 - centreX * nextScale, y: AVATAR_SIZE / 2 - centreY * nextScale }, nextScale))
  }

  function onPointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId)
    const ratio = AVATAR_SIZE / event.currentTarget.getBoundingClientRect().width
    drag.current = { x: event.clientX, y: event.clientY, start: offset, ratio }
  }

  function onPointerMove(event) {
    if (!drag.current) return
    const { x, y, start, ratio } = drag.current
    setOffset(clamp({ x: start.x + (event.clientX - x) * ratio, y: start.y + (event.clientY - y) * ratio }))
  }

  function onKeyDown(event) {
    const moves = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, -STEP], ArrowDown: [0, STEP] }
    if (event.key === '+' || event.key === '=') changeZoom(zoom + 0.1)
    else if (event.key === '-') changeZoom(zoom - 0.1)
    else if (moves[event.key]) setOffset(clamp({ x: offset.x + moves[event.key][0], y: offset.y + moves[event.key][1] }))
    else return
    event.preventDefault()
  }

  async function save() {
    setSaving(true)
    setError('')
    try {
      await onSave(await encodeAvatar(canvasRef.current))
    } catch {
      setError('تعذّر حفظ الصورة. تحقق من الاتصال ثم حاول مرة أخرى.')
      setSaving(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="crop-title"
      onCancel={(event) => {
        event.preventDefault()
        if (!saving) onCancel()
      }}
      className="m-auto w-[min(420px,calc(100%-1.5rem))] rounded-[28px] bg-(--color-page-surface) p-6 text-(color:--color-page-heading) shadow-(--shadow-page-guide) backdrop:bg-(--color-page-guide-backdrop) md:p-8"
    >
      <h2 id="crop-title" className="text-2xl leading-[1.3]">
        اختر جزء الصورة
      </h2>
      <p id="crop-help" className="pt-2 text-sm leading-6 text-(color:--color-page-muted)">
        اسحب الصورة لتحريكها، واستخدم الشريط للتكبير. بالكيبورد: الأسهم للتحريك و+ و- للتكبير.
      </p>
      <div className="flex justify-center pt-5">
        <canvas
          ref={canvasRef}
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          tabIndex={0}
          role="img"
          aria-label="معاينة صورتك الشخصية"
          aria-describedby="crop-help"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          onKeyDown={onKeyDown}
          className="size-60 cursor-grab touch-none rounded-full bg-(--color-page-guide-selected) shadow-[0_0_0_4px_var(--color-page-guide-selected)] outline-(--color-page-primary) active:cursor-grabbing"
        />
      </div>
      <label htmlFor="crop-zoom" className="block pt-5 text-base leading-7 font-bold">
        التكبير
      </label>
      <input
        id="crop-zoom"
        type="range"
        min="1"
        max={MAX_ZOOM}
        step="0.01"
        value={zoom}
        onChange={(event) => changeZoom(Number(event.target.value))}
        className="w-full accent-(--color-page-button)"
      />
      {error && (
        <p role="alert" className="pt-3 text-sm leading-6 text-(color:--color-page-error-text)">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-(--color-page-border) px-7 text-base leading-7 font-bold text-(color:--color-page-primary) outline-(--color-page-primary) disabled:cursor-not-allowed disabled:opacity-50"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-(--color-page-button) px-7 text-base leading-7 font-bold text-white shadow-(--shadow-page-button) outline-(--color-page-primary) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'جارٍ الحفظ…' : 'حفظ الصورة'}
        </button>
      </div>
    </dialog>
  )
}
