import { createFileRoute, redirect } from "@tanstack/react-router"
import { NewsFeed } from "@/components/news/NewsFeed"
import { NEWS_PAGE_SIZE } from "@/lib/news"
import { resolvePage } from "@/lib/routeParams"
import { newsArticlesAtom, preloadAtoms, useQuery } from "@/effect/atoms"

export const Route = createFileRoute("/news/page/{-$page}")({
    head: ({ params }) => ({
        meta: [
            {
                title: `Brawlhalla news — page ${resolvePage(params.page)}`,
            },
        ],
    }),
    loader({ params, context }) {
        const page = resolvePage(params.page)

        // `/news/page` and `/news/page/1` are the canonical `/news`.
        if (page <= 1) {
            throw redirect({ href: "/news", statusCode: 308 })
        }

        return preloadAtoms(context, [
            newsArticlesAtom("", page, NEWS_PAGE_SIZE),
        ])
    },
    component: Page,
})

function Page() {
    const { page: pageParam } = Route.useParams()
    const page = resolvePage(pageParam)
    const { articles, hasNextPage } = useQuery(
        newsArticlesAtom("", page, NEWS_PAGE_SIZE),
    )

    return (
        <NewsFeed
            category=""
            page={page}
            articles={articles}
            hasNextPage={hasNextPage}
        />
    )
}
