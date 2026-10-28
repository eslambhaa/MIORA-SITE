import { supabase } from './supabase.js'

// Free plan limits (supabase.com/docs/guides/platform/billing-on-supabase, checked 2026-10-29).
export const LIMITS = {
  db: { bytes: 500 * 1024 * 1024, label: 'قاعدة البيانات', note: 'عند تجاوزها تتحول القاعدة إلى القراءة فقط.' },
  storage: { bytes: 1024 * 1024 * 1024, label: 'التخزين (الصور الشخصية)', note: null },
  users: { count: 50_000, label: 'المستخدمون النشطون شهريًا' },
}

export const metricLabels = {
  signup: 'حسابات جديدة',
  mood: 'تسجيلات الشعور',
  assessment: 'تقييمات مكتملة',
  exercise: 'تمارين مكتملة',
  journal: 'ملاحظات جديدة',
  assistant: 'محادثات جديدة مع المساعد',
}

export async function loadStats() {
  const { data, error } = await supabase.rpc('admin_stats')
  if (error) throw error
  return data
}

export function statsErrorMessage(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`
  if (text.includes('42501') || text.includes('forbidden')) return 'ليست لديك صلاحية لهذه الصفحة.'
  return 'تعذّر تحميل الإحصاءات الآن. حاول مرة أخرى بعد قليل.'
}

const number = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 1 })

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${number.format(bytes)} بايت`
  if (bytes < 1024 ** 2) return `${number.format(bytes / 1024)} ك.ب`
  if (bytes < 1024 ** 3) return `${number.format(bytes / 1024 ** 2)} م.ب`
  return `${number.format(bytes / 1024 ** 3)} ج.ب`
}

// 'ok' under 70%, 'warn' from 70%, 'danger' from 90%.
export function usageLevel(used, limit) {
  const share = limit > 0 ? used / limit : 0
  if (share >= 0.9) return 'danger'
  if (share >= 0.7) return 'warn'
  return 'ok'
}

export const percent = (used, limit) => (limit > 0 ? Math.min(100, (used / limit) * 100) : 0)

export function daysSince(timestamp, now = new Date()) {
  if (!timestamp) return null
  const then = new Date(timestamp)
  if (Number.isNaN(then.getTime())) return null
  return Math.max(0, Math.floor((now - then) / 86_400_000))
}

// Shapes the weekly rows into one row per metric with the weeks oldest first.
export function weeklyTable(weekly) {
  const weeks = [...new Set(weekly.map((row) => row.week))].sort()
  const metrics = Object.keys(metricLabels).filter((metric) => weekly.some((row) => row.metric === metric))
  return {
    weeks,
    rows: metrics.map((metric) => ({
      metric,
      label: metricLabels[metric],
      cells: weeks.map((week) => weekly.find((row) => row.metric === metric && row.week === week)?.events ?? null),
    })),
  }
}
