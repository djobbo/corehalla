import { ArticlePreview } from "./ArticlePreview"
import { type BHArticle } from "web-parser/common"

type ArticlePreviewGridProps = {
    articles: BHArticle[]
}

export const ArticlePreviewGrid = ({ articles }: ArticlePreviewGridProps) => {
    if (!articles || articles.length <= 0) return null

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
                <ArticlePreview key={article.slug} article={article} />
            ))}
        </div>
    )
}
