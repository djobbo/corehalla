import { createFileRoute } from "@tanstack/react-router"
import { NewsFeed } from "@/components/news/NewsFeed"
import { NEWS_PAGE_SIZE } from "@/lib/news"
import { newsArticlesAtom, preloadAtoms, useQuery } from "@/effect/atoms"

export const Route = createFileRoute("/news/")({
    head: () => ({
        meta: [
            { title: "Brawlhalla news — Corehalla" },
            {
                name: "description",
                content:
                    "The latest Brawlhalla patch notes, announcements, esports and community posts.",
            },
        ],
    }),
    loader: ({ context }) =>
        preloadAtoms(context, [newsArticlesAtom("", 1, NEWS_PAGE_SIZE)]),
    component: Page,
})

function Page() {
    const { articles, hasNextPage } = useQuery(
        newsArticlesAtom("", 1, NEWS_PAGE_SIZE),
    )

    return (
        <NewsFeed
            category=""
            page={1}
            articles={articles}
            hasNextPage={hasNextPage}
        />
    )
}
