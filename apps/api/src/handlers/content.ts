import { Effect } from "effect"
import { HttpApiBuilder, HttpApiError } from "effect/unstable/httpapi"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Content } from "../services/content"

export const contentGroup = HttpApiBuilder.group(
    CorehallaApi,
    "content",
    Effect.fnUntraced(function* (handlers) {
        const content = yield* Content

        return handlers
            .handle("getWeeklyRotation", () => content.getWeeklyRotation())
            .handle("getBHArticles", ({ query }) =>
                content.getArticles({
                    category: query.category,
                    page: query.page,
                    pageSize: query.pageSize,
                }),
            )
            .handle("getBHArticle", ({ params }) =>
                Effect.gen(function* () {
                    const article = yield* content.getArticle(params.slug)

                    if (article === null) {
                        return yield* new HttpApiError.NotFound()
                    }

                    return article
                }),
            )
    }),
)
