import { Effect } from "effect"
import { HttpApiBuilder, HttpApiError } from "effect/http-api"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Cms } from "../services/cms"

export const cmsGroup = HttpApiBuilder.group(
    CorehallaApi,
    "cms",
    Effect.fnUntraced(function* (handlers) {
        const cms = yield* Cms

        return handlers
            .handle("getMediaManifest", () => cms.getMediaManifest())
            .handle("getCmsArticles", ({ query }) =>
                cms.getArticles({
                    page: query.page,
                    pageSize: query.pageSize,
                    category: query.category,
                }),
            )
            .handle("getCmsArticle", ({ params }) =>
                Effect.gen(function* () {
                    const article = yield* cms.getArticle(params.slug)

                    if (article === null) {
                        return yield* new HttpApiError.NotFound()
                    }

                    return article
                }),
            )
    }),
)
