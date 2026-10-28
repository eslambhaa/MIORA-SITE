import ArticleBody from '../components/content/ArticleBody.jsx'
import PageLoader from '../components/ui/PageLoader.jsx'
import { useParams } from 'react-router'
import { useArticle, useArticleList } from '../lib/articles.js'
import NotFound from './NotFound.jsx'

export default function Article() {
  const { slug } = useParams()
  const { article, status } = useArticle(slug)
  const { articles } = useArticleList()

  if (status === 'loading') return <PageLoader label="جارٍ تحميل المقال…" />
  if (!article) return <NotFound />

  return (
    <>
      <title>{`${article.title} | ميورا`}</title>
      <meta name="description" content={article.excerpt} />
      <main className="flex-1 px-6 pt-[43px] pb-[100px]">
        <ArticleBody article={article} others={articles} />
      </main>
    </>
  )
}
