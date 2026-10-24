import { createFileRoute, notFound } from "@tanstack/react-router"
import { PortableText } from "@portabletext/react"
import { CmsImage } from "@/components/common/CmsImage"
import { absoluteUrl } from "@/lib/assets"
import { cmsArticleAtom, preloadAtom } from "@/effect/atoms"
import type { CmsArticle } from "@crh/api-contract/schemas"

export const Route = createFileRoute("/updates/$slug")({
    async loader({ params, context }) {
        let article: CmsArticle

        try {
            article = (await preloadAtom(
                context.registry,
                cmsArticleAtom(params.slug),
            )) as CmsArticle
        } catch {
            throw notFound()
        }

        if (!article) throw notFound()

        return { article }
    },
    head({ loaderData }) {
        const article = loaderData?.article

        if (!article) return {}

        return {
            meta: [
                { title: `${article.title} — Corehalla updates` },
                { name: "description", content: article.excerpt },
                { property: "og:title", content: article.title },
                { property: "og:description", content: article.excerpt },
                ...(article.heroImage
                    ? [
                          {
                              property: "og:image",
                              content: absoluteUrl(article.heroImage.url),
                          },
                      ]
                    : []),
                { property: "og:type", content: "article" },
            ],
        }
    },
    component: Page,
})

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
})

const formatDate = (value: string): string => {
    const date = new Date(value)

    return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

function Page() {
    const { article } = Route.useLoaderData()

    return (
        <main className="ch-page">
            <article className="mx-auto max-w-3xl">
                <p className="ch-kicker">Corehalla updates</p>
                <h1 className="ch-display mt-2 text-3xl md:text-4xl">
                    {article.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <time
                        dateTime={article.publishedAt}
                        className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase"
                    >
                        {formatDate(article.publishedAt)}
                    </time>
                    {article.author ? (
                        <span className="text-xs text-muted-foreground">
                            {article.author.name}
                        </span>
                    ) : null}
                    {article.category ? (
                        <span className="ch-chip ch-chip-off text-[0.58rem]">
                            {article.category.name}
                        </span>
                    ) : null}
                </div>

                {article.heroImage ? (
                    <CmsImage
                        image={article.heroImage}
                        sizes="(min-width: 768px) 768px, 100vw"
                        loading="eager"
                        className="mt-6 aspect-video w-full rounded-2xl bg-card object-cover object-center"
                    />
                ) : null}

                <div className="ch-article mt-6">
                    <PortableText
                        value={
                            article.content as Parameters<
                                typeof PortableText
                            >[0]["value"]
                        }
                    />
                </div>

                {article.tags.length > 0 ? (
                    <footer className="mt-10 flex flex-wrap gap-1.5 border-t border-dashed border-border pt-4">
                        {article.tags.map((tag) => (
                            <span
                                key={tag}
                                className="ch-chip ch-chip-off text-[0.58rem]"
                            >
                                {tag}
                            </span>
                        ))}
                    </footer>
                ) : null}
            </article>
        </main>
    )
}
