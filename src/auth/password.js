const SYMBOLS = /[!@#$%^&*()_+\-=[\]{};':"|<>?,./`~\\]/

export const passwordHint = '8 أحرف على الأقل، وفيها حرف إنجليزي صغير وحرف كبير ورقم ورمز مثل ! أو #.'

export function passwordProblem(password) {
  if (password.length < 8) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.'
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !SYMBOLS.test(password)) {
    return 'كلمة المرور يجب أن تحتوي على حرف إنجليزي صغير وحرف كبير ورقم ورمز مثل ! أو #.'
  }
  return ''
}
