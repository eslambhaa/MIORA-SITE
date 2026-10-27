export function safeRedirect(target, fallback = '/profile') {
  if (typeof target !== 'string') return fallback
  if (!target.startsWith('/') || target.startsWith('//') || target.includes('\\')) return fallback
  return target
}
