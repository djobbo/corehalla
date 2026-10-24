import { Link, createFileRoute } from "@tanstack/react-router"
import { CmsImage } from "@/components/common/CmsImage"
import { cmsArticlesAtom, preloadAtoms, useQuery } from "@/effect/atoms"
import type { CmsArticle } from "@crh/api-contract/schemas"

const PAGE_SIZE = 12

export const Route = createFileRoute("/updates/")({
    head: () => ({
        meta: [
            { title: "Corehalla updates" },
            {
                name: "description",
                content:
                    "Release notes, product updates and newsletter issues from Corehalla.",
            },
        ],
    }),
    loader: ({ context }) =>
        preloadAtoms(context, [cmsArticlesAtom(1, PAGE_SIZE)]),
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

const UpdateCard = ({ article }: { readonly article: CmsArticle }) => (
    <article className="flex flex-col gap-3">
        {article.heroImage ? (
            <Link
                to="/updates/$slug"
                params={{ slug: article.slug }}
                className="relative aspect-video overflow-hidden rounded-2xl bg-card"
            >
                <CmsImage
                    image={article.heroImage}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="size-full object-cover object-center"
                />
            </Link>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
            <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
            </time>
            {article.category ? (
                <span className="ch-chip ch-chip-off text-[0.58rem]">
                    {article.category.name}
                </span>
            ) : null}
        </div>
        <h2 className="text-lg leading-snug font-bold">
            <Link
                to="/updates/$slug"
                params={{ slug: article.slug }}
                className="transition-colors hover:text-ring"
            >
                {article.title}
            </Link>
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
        </p>
    </article>
)

function Page() {
    const { articles } = useQuery(cmsArticlesAtom(1, PAGE_SIZE))

    return (
        <main className="ch-page">
            <p className="ch-kicker">Corehalla</p>
            <h1 className="ch-display mt-1 text-3xl md:text-4xl">Updates</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                Release notes, product changes and newsletter issues, written by
                the Corehalla team.
            </p>

            {articles.length === 0 ? (
                <p className="mt-10 text-sm text-muted-foreground">
                    No updates have been published yet.
                </p>
            ) : (
                <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => (
                        <UpdateCard key={article.id} article={article} />
                    ))}
                </div>
            )}
        </main>
    )
}
