// Buttons the assistant can offer under its replies. Only these internal pages
// can ever be linked: the model writes a key like [[breathing]], never a URL.
export const assistantActions = {
  relaxation: { to: '/relaxation', label: 'تمارين الاسترخاء' },
  breathing: { to: '/relaxation#breathing', label: 'تمرين التنفّس' },
  grounding: { to: '/relaxation#grounding', label: 'تمرين التأريض' },
  mindful: { to: '/relaxation#mindful', label: 'لحظة يقظة قصيرة' },
  body: { to: '/relaxation#body', label: 'استرخاء الجسم' },
  journal: { to: '/journal', label: 'اكتب في مذكراتك' },
  assessment: { to: '/assessment', label: 'التقييمات الذاتية' },
  'assessment-mood': { to: '/assessment?topic=mood', label: 'تقييم المزاج' },
  'assessment-stress': { to: '/assessment?topic=stress', label: 'تقييم التوتر' },
  'assessment-sleep': { to: '/assessment?topic=sleep', label: 'تقييم النوم' },
  'assessment-habits': { to: '/assessment?topic=habits', label: 'تقييم العادات' },
  content: { to: '/content', label: 'المحتوى التوعوي' },
  help: { to: '/help', label: 'متى أطلب دعمًا متخصصًا؟' },
}

// When the model mentions a tool by name without a key (or in older replies).
const mentions = [
  [/تمرين التنفس|تمرين التنفّس|تمارين التنفس|تمارين التنفّس/, 'breathing'],
  [/التأريض/, 'grounding'],
  [/تمارين الاسترخاء|تمرين الاسترخاء|تمرين استرخاء/, 'relaxation'],
  [/المذكرات|مذكراتك|مذكراتي/, 'journal'],
  [/التقييمات الذاتية|التقييم الذاتي/, 'assessment'],
  [/المحتوى التوعوي|المقالات/, 'content'],
]

const MAX_ACTIONS = 3

export function parseReply(text) {
  const keys = []
  // Remove every [[...]] marker from the text; keep only known keys as buttons.
  const body = text.replace(/\[\[([^\]\n]{0,40})\]\]/g, (_, key) => {
    const clean = key.trim().toLowerCase()
    if (assistantActions[clean] && !keys.includes(clean)) keys.push(clean)
    return ''
  })
  if (keys.length === 0) {
    for (const [pattern, key] of mentions) {
      if (pattern.test(body) && !keys.includes(key)) keys.push(key)
    }
    // A specific exercise makes the general relaxation button redundant.
    if (keys.includes('relaxation') && keys.some((key) => ['breathing', 'grounding'].includes(key))) {
      keys.splice(keys.indexOf('relaxation'), 1)
    }
  }
  return {
    text: body.replace(/\n{3,}/g, '\n\n').trim(),
    actions: keys.slice(0, MAX_ACTIONS).map((key) => ({ key, ...assistantActions[key] })),
  }
}
