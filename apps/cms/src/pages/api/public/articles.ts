import type { APIRoute } from "astro"
import { Effect } from "effect"
import { getEmDashCollection } from "emdash"
import { articleOf, json, pageParam } from "../../../lib/public-api"

export const prerender = false

const DEFAULT_PAGE_SIZE = 12

const load = Effect.fn("cms.articles.GET")(
    function* (url: URL) {
        const page = pageParam(url.searchParams.get("page"), 1, 1, 10_000)
        const pageSize = pageParam(
            url.searchParams.get("pageSize"),
            DEFAULT_PAGE_SIZE,
            1,
            50,
        )

        const { entries, hasMore, error } = yield* Effect.tryPromise({
            try: () =>
                getEmDashCollection("posts", {
                    limit: pageSize,
                    offset: (page - 1) * pageSize,
                    orderBy: { published_at: "desc" },
                }),
            catch: (cause) => new Error(String(cause)),
        })

        if (error) {
            return json(
                {
                    articles: [],
                    page,
                    totalPages: 0,
                    hasNextPage: false,
                },
                500,
            )
        }

        return json({
            articles: entries
                .map((entry) => articleOf(entry))
                .filter(
                    (article): article is NonNullable<typeof article> =>
                        article !== null,
                ),
            page,
            totalPages: hasMore ? page + 1 : page,
            hasNextPage: hasMore,
        })
    },
    Effect.orElseSucceed(() =>
        json(
            {
                articles: [],
                page: 1,
                totalPages: 0,
                hasNextPage: false,
            },
            500,
        ),
    ),
)

export const GET: APIRoute = ({ url }) => Effect.runPromise(load(url))
