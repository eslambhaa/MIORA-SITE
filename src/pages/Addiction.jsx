import { Link } from 'react-router'
import ArticleCard from '../components/content/ArticleCard.jsx'
import DisclaimerNote from '../components/content/DisclaimerNote.jsx'
import MediaCard from '../components/content/MediaCard.jsx'
import { ADDICTION_TOPIC, findAddictionLine, isAddictionArticle, isAddictionEpisode } from '../lib/addiction.js'
import { useArticleList } from '../lib/articles.js'
import { useEmergencyLines } from '../lib/emergency.js'
import { useResources } from '../lib/resources.js'

// Draft educational text written by Claude: needs a specialist's review, like the articles.
const ideas = [
  {
    title: 'الإدمان ليس ضعفًا في الشخصية',
    text: 'هو حالة صحية تؤثر في الدماغ والسلوك، ويمكن أن تصيب أي شخص. الحديث عنه بلا لوم يجعل طلب المساعدة أسهل.',
  },
  {
    title: 'قد يكون مادة أو سلوكًا',
    text: 'مثل التدخين أو الكحول أو المخدرات، أو سلوكيات كالمقامرة والإفراط في الألعاب. العلامة المشتركة: صعوبة التوقف رغم الضرر.',
  },
  {
    title: 'التعافي ممكن',
    text: 'كثيرون يتعافون بالدعم المناسب. والانتكاسة إن حدثت قد تكون جزءًا من الطريق، وليست نهايته.',
  },
]

const callSteps = ['المكالمة مجانية وسرية.', 'يرد عليك فريق متخصص يستمع ويوجّهك للخطوة المناسبة.', 'يمكنك الاتصال عن نفسك، أو عن شخص من أسرتك أو أصدقائك.']

const libraryLink = `/content?category=${encodeURIComponent(ADDICTION_TOPIC)}`

const sectionLink =
  'inline-flex items-center gap-[7px] text-base leading-7 font-bold text-(color:--color-page-primary) outline-(--color-page-primary) hover:underline'

export default function Addiction() {
  const line = findAddictionLine(useEmergencyLines())
  const { articles, loading: articlesLoading } = useArticleList()
  const { rows, status } = useResources(true)

  const topicArticles = articles.filter(isAddictionArticle)
  const episodes = (rows ?? []).filter(isAddictionEpisode)
  const episodesLoading = !rows && status !== 'error'

  return (
    <>
      <title>الوعي بالإدمان | ميورا</title>
      <meta name="description" content="معلومات بسيطة وغير وصمية عن الإدمان على المواد أو السلوكيات، ومسار واضح لطلب المساعدة في مصر بسرية." />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[50px] text-center md:pb-[70px]">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">{ADDICTION_TOPIC}</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">فهمٌ بلا لوم، ودعمٌ متاح</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">
            معلومات بسيطة عن الإدمان على المواد أو السلوكيات، وكيف تبدأ أنت أو من تحب طريق المساعدة. بلا أحكام، وبسرية.
          </p>
        </section>

        <section aria-labelledby="ideas-title" className="px-6 pb-14">
          <div className="mx-auto max-w-[1026px]">
            <h2 id="ideas-title" className="text-2xl leading-[1.4] tracking-[-0.02em] md:text-[28px]">ثلاث أفكار تبدأ منها</h2>
            <ul className="grid gap-[22px] pt-6 md:grid-cols-3">
              {ideas.map((idea) => (
                <li key={idea.title} className="rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface) p-[22px]">
                  <h3 className="text-[21px] leading-[1.4] tracking-[-0.02em]">{idea.title}</h3>
                  <p className="pt-2.5 text-base leading-7 text-(color:--color-page-muted)">{idea.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="help-path" aria-labelledby="help-path-title" className="scroll-mt-28 px-6 pb-14">
          <div className="mx-auto grid max-w-[1026px] gap-6 rounded-(--radius-page-card) bg-(--color-page-guide-panel) p-6 text-white md:grid-cols-[1fr_320px] md:p-10">
            <div>
              <h2 id="help-path-title" className="text-2xl leading-[1.4] tracking-[-0.02em] md:text-[28px]">مسار المساعدة</h2>
              <p className="pt-2 text-base leading-7 text-(color:--color-page-guide-panel-text)">
                إذا شعرت أن عادة ما صارت أقوى منك، أو قلقت على شخص قريب، فالخطوة الأولى مكالمة. ماذا تتوقع عند الاتصال؟
              </p>
              <ul className="flex flex-col gap-2 pt-4">
                {callSteps.map((step) => (
                  <li key={step} className="flex items-start gap-2.5 text-base leading-7">
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0 text-(color:--color-page-guide-panel-muted)">
                      <path d="M5 10.5l3 3 7-7" />
                    </svg>
                    {step}
                  </li>
                ))}
              </ul>
              <p className="pt-5 text-base leading-7 text-(color:--color-page-guide-panel-text)">
                إذا كان هناك خطر على الحياة الآن، اتصل بالإسعاف أو راجع{' '}
                <Link to="/help#emergency" className="font-bold text-white underline underline-offset-4 outline-white">
                  أرقام الطوارئ
                </Link>
                .
              </p>
            </div>
            <a
              href={`tel:${line.number}`}
              className="flex flex-col justify-center self-start rounded-[16px] bg-(--color-page-surface) p-6 text-(color:--color-page-heading) outline-white transition-shadow duration-200 hover:shadow-(--shadow-page-card) motion-reduce:transition-none"
            >
              <span className="text-sm leading-6 font-bold text-(color:--color-page-muted)">اتصل الآن</span>
              <span dir="ltr" className="self-start text-[40px] leading-[1.25] font-extrabold text-(color:--color-page-primary)">
                {line.number}
              </span>
              <span className="pt-1 text-base leading-7 font-bold">{line.title}</span>
              {line.note && <span className="text-sm leading-6 text-(color:--color-page-muted)">{line.note}</span>}
            </a>
          </div>
        </section>

        <section aria-labelledby="articles-title" className="px-6 pb-14">
          <div className="mx-auto max-w-[1026px]">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="articles-title" className="text-2xl leading-[1.4] tracking-[-0.02em] md:text-[28px]">مقالات للقراءة</h2>
              <Link to={libraryLink} className={sectionLink}>
                كل مقالات التصنيف في المكتبة
                <img src="/icons/home/read-arrow.svg" alt="" width="17" height="17" className="-scale-x-100" />
              </Link>
            </div>
            {articlesLoading ? (
              <p role="status" className="pt-6 text-base leading-7 text-(color:--color-page-muted)">جارٍ التحميل…</p>
            ) : topicArticles.length > 0 ? (
              <ul className="grid grid-cols-1 gap-[22px] pt-6 sm:grid-cols-2 lg:grid-cols-3">
                {topicArticles.map((article) => (
                  <li key={article.slug}>
                    <ArticleCard article={article} headingLevel="h3" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pt-6 text-base leading-7 text-(color:--color-page-muted)">نجهّز مقالات عن هذا الموضوع، وستظهر هنا قريبًا.</p>
            )}
          </div>
        </section>

        <section aria-labelledby="media-title" className="px-6 pb-[105px]">
          <div className="mx-auto max-w-[1026px]">
            <h2 id="media-title" className="text-2xl leading-[1.4] tracking-[-0.02em] md:text-[28px]">فيديوهات وبودكاست</h2>
            {episodesLoading ? (
              <p role="status" className="pt-6 text-base leading-7 text-(color:--color-page-muted)">جارٍ التحميل…</p>
            ) : episodes.length > 0 ? (
              <>
                <p className="max-w-[700px] pt-2 text-base leading-7 text-(color:--color-page-muted)">الحلقات تعبّر عن رأي أصحابها وتُعرض هنا للتوعية، ولا تغني عن استشارة متخصص.</p>
                <ul className="grid grid-cols-1 gap-[22px] pt-6 sm:grid-cols-2 lg:grid-cols-3">
                  {episodes.map((item) => (
                    <li key={item.id}>
                      <MediaCard item={item} headingLevel="h3" />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="pt-6 text-base leading-7 text-(color:--color-page-muted)">
                {status === 'error' ? 'تعذّر تحميل الحلقات الآن. حاول مرة أخرى بعد قليل.' : 'نجهّز حلقات عربية مختارة عن هذا الموضوع، وستظهر هنا قريبًا.'}
              </p>
            )}
            <DisclaimerNote>المحتوى هنا تعليمي، ولا يقدّم تشخيصًا أو خطة علاج.</DisclaimerNote>
          </div>
        </section>
      </main>
    </>
  )
}
