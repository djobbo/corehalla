import { Context, Effect, Layer } from "effect"
import {
    getBrawlhallaArticle,
    getBrawlhallaArticles,
    getWeeklyRotation as getWeeklyRotationFn,
} from "@crh/web-parser/common"
import { ContentError } from "@crh/core/errors"
import { NEWS_PAGE_SIZE } from "@crh/api-contract/schemas"
import type { ArticlesPage } from "@crh/api-contract/schemas"
import type { BHArticleDetail } from "@crh/web-parser/common"
import type { Legend } from "@crh/bhapi/types"

/**
 * WP GraphQL exposes no `offset`, so a numbered page fetches `page * pageSize`
 * from the head of the connection and slices. The cap keeps a hand-typed page
 * number from asking the CMS for the entire archive.
 */
const MAX_FIRST = 120

export type GetArticlesOptions = {
    readonly category?: string | undefined
    readonly page?: number | undefined
    readonly pageSize?: number | undefined
}

export class Content extends Context.Service<
    Content,
    {
        readonly getWeeklyRotation: () => Effect.Effect<readonly Legend[]>
        readonly getArticles: (
            options: GetArticlesOptions,
        ) => Effect.Effect<ArticlesPage>
        readonly getArticle: (
            slug: string,
        ) => Effect.Effect<BHArticleDetail | null>
    }
>()("app/Content") {}

const run = <A>(f: () => Promise<A>) =>
    Effect.tryPromise({
        try: f,
        catch: (cause) => new ContentError({ cause }),
    }).pipe(Effect.orDie)

export const layer = Layer.succeed(Content, {
    getWeeklyRotation: () => run(() => getWeeklyRotationFn()),

    getArticles: ({ category, page, pageSize }) =>
        run(async () => {
            const size = Math.max(1, pageSize ?? NEWS_PAGE_SIZE)
            const current = Math.max(1, page ?? 1)
            const first = Math.min(current * size, MAX_FIRST)

            const result = await getBrawlhallaArticles({
                // `""` is the "all categories" sentinel the client sends.
                category: category ? category : null,
                first,
            })

            const start = (current - 1) * size
            const articles = result.articles.slice(start, start + size)
            // When the cap kicked in the tail is beyond what we fetched — no next page.
            const truncated = first < current * size

            return {
                articles,
                hasNextPage:
                    !truncated &&
                    (result.articles.length > start + size ||
                        result.hasNextPage),
            }
        }),

    getArticle: (slug) => run(() => getBrawlhallaArticle(slug)),
})
