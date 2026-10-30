# ميورا — تعليمات العمل

## المشروع
- موقع تعليمي للعافية النفسية، عربي RTL (`lang="ar" dir="rtl"`). يُكتب الاسم في النص "ميورا".
- مصدر التصميم: Figma، الملف `gulOSrgZGIJfpfXkwp7mtx`. قيم Figma تتقدم على أي وصف آخر.
- النسخة HTML المسلَّمة سابقًا في `../` (الصفحات الخمس) هي المرجع لنقل الهيدر والفوتر والصفحات الخمس.
- Supabase: مشروع `miora`، المعرّف `coryhyailrfivsuoektx`، منطقة `eu-central-1`، خطة مجانية.

## الأدوات
- React 19 + Vite 8 + React Router 8 (الاستيراد من `react-router`)، JavaScript وليس TypeScript.
- Tailwind CSS v4 فقط؛ المتغيرات في `src/index.css`، وتُستخدم بصيغة v4: `bg-(--x)` و `text-(color:--x)`.
- Supabase للحسابات (إيميل/كلمة سر + جوجل) والبيانات والدوال (Edge Functions).
- المساعد الذكي: Gemini عبر Edge Function، والمفتاح سرّ على الخادم فقط.

## القواعد
- استخدم دائمًا أحدث الإصدارات، وتحقق من التوثيق (Context7) قبل كتابة الكود.
- اذكر المهارة أو الإضافة المستخدمة في كل رد.
- لا مفاتيح سرية في الواجهة. فقط `VITE_SUPABASE_URL` و `VITE_SUPABASE_PUBLISHABLE_KEY` في `.env`.
- RLS مفعّلة على كل جدول، وكل سياسة تربط الصف بـ `auth.uid()`.
- إمكانية الوصول: تباين WCAG AA، إطار تركيز ظاهر، `label` لكل حقل، احترام تقليل الحركة، `h1` واحد لكل صفحة.
- العمل مرحلة بمرحلة: بعد كل مرحلة تحديث `HANDOFF.md` وتقرير بالعربي، ولا تبدأ المرحلة التالية قبل "كمّل".
- محتوى المقالات والمساعد: لا تشخيص، ولا بديل عن المتخصص، ومسودات المقالات تحتاج مراجعة متخصص.

## Testing
- الأمر: `npm test` (Vitest). الاختبارات بجانب الملفات داخل `src/` باسم `*.test.js(x)`. التفاصيل في `TESTING.md`.
- كل إصلاح خلل يحتاج اختبار انحدار، والدوال الجديدة تُختبر في الحالتين.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
