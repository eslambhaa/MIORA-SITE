import { Link, useParams } from 'react-router'
import DisclaimerNote from '../components/content/DisclaimerNote.jsx'
import MediaCard, { kindLabel } from '../components/content/MediaCard.jsx'
import MediaPlayer from '../components/content/MediaPlayer.jsx'
import { useResources } from '../lib/resources.js'
import NotFound from './NotFound.jsx'

// One page for a podcast episode or a video: /content/podcast/:id and /content/video/:id.
export default function MediaPage({ kind }) {
  const { id } = useParams()
  const { rows, status } = useResources(true)

  if (!rows) {
    return (
      <main className="flex-1 px-6 pt-[120px] pb-[100px] text-center">
        <title>ميورا</title>
        <p role="status" className="text-lg leading-8 text-(color:--color-page-muted)">
          {status === 'error' ? 'تعذّر تحميل الصفحة الآن. حاول مرة أخرى بعد قليل.' : 'جارٍ التحميل…'}
        </p>
      </main>
    )
  }

  const item = /^\d+$/.test(id) ? rows.find((row) => row.id === Number(id) && row.kind === kind) : null
  if (!item) return <NotFound />

  const isVideo = kind === 'video'
  const back = `/content?type=${isVideo ? 'videos' : 'podcasts'}`
  const paragraphs = (item.details || item.description).split(/\n\s*\n/)
  const more = rows.filter((row) => row.kind === kind && row.id !== item.id).slice(0, 3)

  return (
    <>
      <title>{`${item.title} | ميورا`}</title>
      <meta name="description" content={item.description} />
      <main className="flex-1 px-6 pt-[43px] pb-[100px]">
        <div className="mx-auto max-w-[980px]">
          <Link to={back} className="inline-flex items-center gap-[7px] text-xl leading-7 font-bold text-(color:--color-page-primary) outline-(--color-page-primary) hover:underline md:text-2xl">
            <img src="/icons/content/back.svg" alt="" width="41" height="41" className="size-8 md:size-[41px]" />
            العودة إلى المكتبة
          </Link>
          <header className="mx-auto max-w-[800px] pt-[45px] text-center">
            <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">
              {kindLabel[kind]}
              {item.topic ? ` · ${item.topic}` : ''}
            </p>
            <h1 className="text-[34px] leading-[1.3] tracking-[-0.02em] md:text-[58px]">{item.title}</h1>
            <p className="pt-2 text-lg leading-[35px] text-(color:--color-page-muted) md:text-xl">{item.description}</p>
            <p className="pt-1 text-[13px] leading-[22.75px] text-(color:--color-page-muted)">{item.source}</p>
          </header>
          <div className="mx-auto mt-[45px] max-w-[800px]">
            <MediaPlayer item={item} />
          </div>
          <div className="mx-auto mt-[55px] max-w-[800px]">
            <section aria-labelledby="about-episode">
              <h2 id="about-episode" className="text-[26px] leading-[39px] tracking-[-0.02em] md:text-[30px]">عن هذه الحلقة</h2>
              {paragraphs.map((text) => (
                <p key={text} className="pt-2.5 text-lg leading-9">{text}</p>
              ))}
              <p className="pt-4 text-base leading-7 text-(color:--color-page-muted)">المصدر: {item.source}.</p>
            </section>
            <DisclaimerNote>
              هذه الحلقة تعبّر عن رأي أصحابها وتُعرض هنا للتوعية، ولا تغني عن التشخيص أو العلاج المتخصص.
            </DisclaimerNote>
          </div>
          {more.length > 0 && (
            <section aria-labelledby="more-episodes" className="mt-20">
              <h2 id="more-episodes" className="text-[26px] leading-[39px] tracking-[-0.02em] md:text-[30px]">
                {isVideo ? 'فيديوهات أخرى' : 'حلقات أخرى'}
              </h2>
              <ul className="mt-6 grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
                {more.map((row) => (
                  <li key={row.id}>
                    <MediaCard item={row} headingLevel="h3" />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
