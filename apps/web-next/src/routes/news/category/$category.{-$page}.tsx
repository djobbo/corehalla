import { createFileRoute } from "@tanstack/react-router"
import { NewsFeed } from "@/components/news/NewsFeed"
import { NEWS_PAGE_SIZE, newsCategoryLabel } from "@/lib/news"
import { resolvePage } from "@/lib/routeParams"
import { newsArticlesAtom, preloadAtoms, useQuery } from "@/effect/atoms"

export const Route = createFileRoute("/news/category/$category/{-$page}")({
    head: ({ params }) => ({
        meta: [
            {
                title: `${newsCategoryLabel(params.category)} — Brawlhalla news`,
            },
        ],
    }),
    loader: ({ params, context }) =>
        preloadAtoms(context, [
            newsArticlesAtom(
                params.category,
                resolvePage(params.page),
                NEWS_PAGE_SIZE,
            ),
        ]),
    component: Page,
})

function Page() {
    const { category, page: pageParam } = Route.useParams()
    const page = resolvePage(pageParam)
    const { articles, hasNextPage } = useQuery(
        newsArticlesAtom(category, page, NEWS_PAGE_SIZE),
    )

    return (
        <NewsFeed
            category={category}
            page={page}
            articles={articles}
            hasNextPage={hasNextPage}
        />
    )
}
