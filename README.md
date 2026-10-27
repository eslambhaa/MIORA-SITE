# ميورا — miora-app

موقع ميورا للتوعية بالعافية النفسية (مشروع تخرج، جامعة الزقازيق).

## التشغيل على جهازك
يحتاج Node.js 22 أو أحدث.

```bash
cd miora-app
npm install
npm run dev
```

ثم افتح الرابط الذي يظهر في Terminal (عادة http://localhost:5173).

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | تشغيل نسخة التطوير |
| `npm run build` | بناء نسخة النشر في `dist/` |
| `npm run preview` | معاينة نسخة النشر |

## الأدوات
- React 19 + Vite 8 + React Router 8
- Tailwind CSS v4 عبر `@tailwindcss/vite`
- Supabase (قاعدة البيانات والحسابات والدوال) — من المرحلة 2
- خط Almarai من Google Fonts
