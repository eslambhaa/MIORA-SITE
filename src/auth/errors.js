export function authErrorMessage(error) {
  if (!error) return ''
  const code = error.code ?? ''
  const status = error.status ?? 0

  if (status === 429 || code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') {
    return 'محاولات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.'
  }
  if (code === 'invalid_credentials') return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
  if (code === 'email_not_confirmed') return 'يجب تأكيد بريدك الإلكتروني أولًا. افتح رسالة التأكيد التي أرسلناها إليك.'
  if (code === 'weak_password') return 'كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل، ويفضّل أن تجمع بين حروف وأرقام.'
  if (code === 'same_password') return 'اختر كلمة مرور مختلفة عن السابقة.'
  if (code === 'validation_failed' || code === 'email_address_invalid') return 'تحقق من البريد الإلكتروني وكلمة المرور.'
  if (code === 'provider_disabled' || code === 'oauth_provider_not_supported') return 'تسجيل الدخول بحساب Google غير مفعّل بعد.'
  if (code === 'signup_disabled') return 'إنشاء الحسابات متوقف مؤقتًا.'
  if (error.name === 'AuthRetryableFetchError' || status === 0) return 'تعذّر الاتصال. تحقق من الإنترنت ثم حاول مرة أخرى.'
  return 'حدث خطأ غير متوقع. حاول مرة أخرى.'
}
