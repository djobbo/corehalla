import { AdsenseArticles } from "common/analytics/Adsense"
import { ArticlePreview } from "./ArticlePreview"
import { type BHArticle } from "web-parser/common"

type ArticlePreviewGridProps = {
    articles: readonly BHArticle[]
}

/**
 * Landing page news layout.
 *
 * On large screens this is two columns instead of the previous three: the lead
 * story fills the left column, and the right column stacks the two smaller
 * stories with a small ad unit as the last card. Below `md` everything
 * collapses to one column, keeping the same order.
 */
export const ArticlePreviewGrid = ({ articles }: ArticlePreviewGridProps) => {
    if (!articles || articles.length <= 0) return null

    const [featured, ...rest] = articles
    const [firstSmall, secondSmall] = rest

    return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {featured && (
                <ArticlePreview article={featured} variant="featured" />
            )}
            <div className="flex flex-col gap-8">
                {firstSmall && (
                    <ArticlePreview article={firstSmall} variant="compact" />
                )}
                {secondSmall && (
                    <ArticlePreview article={secondSmall} variant="compact" />
                )}
                <AdsenseArticles />
            </div>
        </div>
    )
}
