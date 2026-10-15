import { Link } from "@tanstack/react-router"
import { NewsCard } from "./NewsCard"
import type { BHArticle } from "@crh/api-contract/schemas"

export const LatestNews = ({
    articles,
}: {
    readonly articles: readonly BHArticle[]
}) => {
    if (articles.length === 0) return null

    const [featured, ...rest] = articles

    return (
        <section aria-labelledby="latest-news" className="mt-12">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p id="latest-news" className="ch-kicker">
                    Latest news
                </p>
                <Link
                    to="/news"
                    className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                >
                    All news
                </Link>
            </div>

            <div className="mt-3 grid gap-6 md:grid-cols-2">
                {featured ? (
                    <NewsCard article={featured} variant="featured" />
                ) : null}
                <div className="flex flex-col justify-center gap-6">
                    {rest.slice(0, 2).map((article) => (
                        <NewsCard
                            key={article.slug}
                            article={article}
                            variant="compact"
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
