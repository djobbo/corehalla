import { Link } from "@tanstack/react-router"
import { NewsCard, NewsHero } from "./NewsCard"
import { PageNav } from "@/components/common/PageNav"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import { cn } from "@/lib/cn"
import { newsCategories, newsCategoryLabel, newsHref } from "@/lib/news"
import type { BHArticle } from "@crh/api-contract/schemas"

const CategoryTabs = ({ category }: { readonly category: string }) => (
    <nav aria-label="News categories" className="ch-tabline">
        {newsCategories.map((entry) => {
            const current = entry.slug === category

            return (
                <Link
                    key={entry.slug || "all"}
                    to={newsHref(entry.slug)}
                    aria-current={current ? "page" : undefined}
                    className={cn("ch-tablink", current && "ch-tablink-on")}
                >
                    {entry.label}
                </Link>
            )
        })}
    </nav>
)

export const NewsFeed = ({
    category,
    page,
    articles,
    hasNextPage,
}: {
    readonly category: string
    readonly page: number
    readonly articles: readonly BHArticle[]
    readonly hasNextPage: boolean
}) => {
    const isFirstPage = page <= 1
    const [lead, ...rest] = articles
    const grid = isFirstPage && lead ? rest : articles

    return (
        <main className="ch-page">
            <header className="ch-hero">
                <p className="ch-kicker">Brawlhalla</p>
                <h1 className="ch-display mt-1 text-2xl">
                    {category === "" ? "News" : newsCategoryLabel(category)}
                </h1>
            </header>

            <div className="mt-4">
                <CategoryTabs category={category} />
            </div>

            {articles.length === 0 ? (
                <Empty className="mt-6 rounded-2xl bg-card py-10">
                    <EmptyHeader>
                        <EmptyDescription>
                            No articles here yet.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="mt-6 flex flex-col gap-8">
                    {isFirstPage && lead ? <NewsHero article={lead} /> : null}

                    {grid.length > 0 ? (
                        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {grid.map((article) => (
                                <li key={article.slug}>
                                    <NewsCard article={article} />
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            )}

            <PageNav
                prevHref={page > 1 ? newsHref(category, page - 1) : undefined}
                nextHref={
                    hasNextPage ? newsHref(category, page + 1) : undefined
                }
            />
        </main>
    )
}
