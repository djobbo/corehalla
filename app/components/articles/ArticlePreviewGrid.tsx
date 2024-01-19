import { ArticlePreview } from "./ArticlePreview"
import {
    type BrawlhallaArticleVariables,
    getBrawlhallaArticles,
} from "web-parser/common"

export const ArticlePreviewGrid = async (
    props: Partial<BrawlhallaArticleVariables>,
) => {
    const articles = await getBrawlhallaArticles(props)

    if (!articles || articles.length <= 0) return null

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
                <ArticlePreview key={article.slug} article={article} />
            ))}
        </div>
    )
}
