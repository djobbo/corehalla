import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import {
    articleDateTime,
    articleHeroImage,
    formatArticleDate,
    newsHref,
} from "@/lib/news"
import {
    dehydrateRegistry,
    newsArticleAtom,
    preloadAtom,
    useQuery,
} from "@/effect/atoms"
import type { BHArticleDetail } from "@crh/api-contract/schemas"

export const Route = createFileRoute("/news/$slug")({
    async loader({ params, context }) {
        let article: BHArticleDetail

        try {
            article = (await preloadAtom(
                context.registry,
                newsArticleAtom(params.slug),
            )) as BHArticleDetail
        } catch {
            throw notFound()
        }

        return {
            article,
            dehydrated: import.meta.env.SSR
                ? dehydrateRegistry(context.registry)
                : [],
        }
    },
    head({ loaderData }) {
        const article = loaderData?.article

        if (!article) return {}

        return {
            meta: [
                { title: `${article.title} — Brawlhalla news` },
                {
                    name: "description",
                    content: article.excerpt,
                },
                { property: "og:title", content: article.title },
                { property: "og:description", content: article.excerpt },
                {
                    property: "og:image",
                    content: article.featuredImage.sourceUrl,
                },
                { property: "og:type", content: "article" },
            ],
        }
    },
    component: Page,
})

function Page() {
    const { slug } = Route.useParams()
    const article = useQuery(newsArticleAtom(slug))

    return (
        <main className="ch-page">
            <article className="mx-auto max-w-3xl">
                <Link to="/news" className="ch-kicker hover:text-foreground">
                    <span aria-hidden>&larr;</span> Brawlhalla news
                </Link>

                <h1 className="ch-display mt-3 text-2xl md:text-4xl">
                    {article.title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <time
                        dateTime={articleDateTime(article.dateGmt)}
                        className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase"
                    >
                        {formatArticleDate(article.dateGmt)}
                    </time>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {article.categories.map((category) => (
                            <Link
                                key={category.slug}
                                to={newsHref(category.slug)}
                                className="ch-chip ch-chip-off text-[0.58rem]"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <img
                    src={articleHeroImage(article)}
                    alt=""
                    className="mt-6 aspect-video w-full rounded-2xl bg-card object-cover object-center"
                />

                {/*
                 * `content` is sanitized by `sanitizeArticleHtml` in the
                 * web-parser before it leaves the API.
                 */}
                <div
                    className="ch-article mt-6"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                <footer className="mt-10 border-t border-dashed border-border pt-4 text-sm text-muted-foreground">
                    Originally published on{" "}
                    <a
                        href={`https://www.brawlhalla.com/news/${article.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-2 hover:text-foreground"
                    >
                        brawlhalla.com
                    </a>
                    .
                </footer>
            </article>
        </main>
    )
}
