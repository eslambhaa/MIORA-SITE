import { useState } from 'react'
import GuideDialog from '../components/GuideDialog.jsx'
import ArticleHighlights from '../components/home/ArticleHighlights.jsx'
import ChatButton from '../components/home/ChatButton.jsx'
import GuideBanner from '../components/home/GuideBanner.jsx'
import HomeHero from '../components/home/HomeHero.jsx'
import MoodCheckIn from '../components/home/MoodCheckIn.jsx'
import ReflectionTools from '../components/home/ReflectionTools.jsx'

export default function Home() {
  const [guideOpen, setGuideOpen] = useState(false)
  const openGuide = () => setGuideOpen(true)

  return (
    <>
      <title>ميورا | مساحة هادئة. خطوة حقيقية.</title>
      <meta name="description" content="ميورا مساحة تعليمية للعافية النفسية: سجّل شعورك، تعرّف على أدوات التأمل، واقرأ محتوى مبسّطًا يساعدك في يومك." />
      <main className="slides flex-1">
        <HomeHero onExplore={openGuide} />
        <MoodCheckIn />
        <GuideBanner onExplore={openGuide} />
        <ReflectionTools />
        <ArticleHighlights />
      </main>
      <ChatButton />
      <GuideDialog open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  )
}
