import { ArticlePreview } from "./ArticlePreview"
import type { BHArticle } from "@ch/web-parser/bh-articles/parseBHArticlesPage"

type ArticlePreviewGridProps = {
    articles: BHArticle[]
}

export const ArticlePreviewGrid = ({ articles }: ArticlePreviewGridProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
                <ArticlePreview key={article.id} article={article} />
            ))}
        </div>
    )
}
