import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

// The numbers the help page shows. This copy is used immediately and whenever the database cannot be read
// or has no published number, so the "in danger now" card is never empty.
export const fallbackLines = [
  { id: 'f1', country: 'مصر', title: 'الإسعاف', number: '123', note: 'إذا كنت أنت أو غيرك في خطر الآن.' },
  { id: 'f2', country: 'مصر', title: 'الخط الساخن للدعم النفسي', number: '16328', note: 'من وزارة الصحة، على مدار الساعة.' },
  { id: 'f3', country: 'مصر', title: 'الخط الساخن الموحد لوزارة الصحة', number: '105', note: 'استفسارات صحية وتوجيه للخدمات.' },
]

// Only digits and an optional leading + can reach a tel: link (the database enforces the same rule).
export const isDialable = (value) => /^\+?[0-9]{3,15}$/.test(value)

// Groups lines by country, keeping the order. One country gives one group (no sub-headings needed).
export function groupByCountry(lines) {
  const groups = []
  for (const line of lines) {
    const group = groups.find((item) => item.country === line.country)
    if (group) group.lines.push(line)
    else groups.push({ country: line.country, lines: [line] })
  }
  return groups
}

// The saved copy shows first, so the numbers are on screen at once; the database copy replaces it when it arrives.
export function useEmergencyLines() {
  const [lines, setLines] = useState(fallbackLines)

  useEffect(() => {
    if (!supabase) return undefined
    let ignore = false
    supabase
      .from('emergency_contacts')
      .select('id, country, title, number, note')
      .eq('published', true)
      .order('sort_order')
      .order('id')
      .then(({ data, error }) => {
        if (ignore || error) return
        const clean = data.filter((line) => isDialable(line.number))
        if (clean.length > 0) setLines(clean)
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])

  return lines
}
