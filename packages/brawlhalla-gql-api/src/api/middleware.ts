import { Effect, Schema } from "effect"
import { HttpClientRequest } from "effect/unstable/http"
import { HttpApiMiddleware } from "effect/unstable/httpapi"

import { articlesQuery } from "../queries/articles.js"
import {
    PostsVariables,
    type PostsVariables as PostsVariablesType,
} from "../schema/posts-variables.js"

const readPostsVariables = (
    request: HttpClientRequest.HttpClientRequest,
): PostsVariablesType => {
    try {
        if (request.body._tag === "Uint8Array") {
            const text = new TextDecoder().decode(request.body.body)
            return Schema.decodeUnknownSync(PostsVariables)(
                JSON.parse(text) as unknown,
            )
        }

        if (
            request.body._tag === "Raw" &&
            typeof request.body.body === "string"
        ) {
            return Schema.decodeUnknownSync(PostsVariables)(
                JSON.parse(request.body.body) as unknown,
            )
        }
    } catch {
        return {}
    }

    return {}
}

const graphqlBodyMiddleware =
    (query: string, defaults: PostsVariablesType = {}) =>
    ({
        next,
        request,
    }: {
        readonly next: (
            request: HttpClientRequest.HttpClientRequest,
        ) => Effect.Effect<unknown, unknown, unknown>
        readonly request: HttpClientRequest.HttpClientRequest
    }) =>
        Effect.gen(function* () {
            const variables = {
                ...defaults,
                ...readPostsVariables(request),
            }

            const nextRequest = yield* HttpClientRequest.bodyJson(request, {
                query,
                variables,
            })

            return yield* next(nextRequest)
        })

export class ArticlesListQueryMiddleware extends HttpApiMiddleware.Service<ArticlesListQueryMiddleware>()(
    "BrawlhallaGql/ArticlesListQuery",
    { requiredForClient: true },
) {}

export class ArticlesWithContentQueryMiddleware extends HttpApiMiddleware.Service<ArticlesWithContentQueryMiddleware>()(
    "BrawlhallaGql/ArticlesWithContentQuery",
    { requiredForClient: true },
) {}

export class ArticlesPreviewQueryMiddleware extends HttpApiMiddleware.Service<ArticlesPreviewQueryMiddleware>()(
    "BrawlhallaGql/ArticlesPreviewQuery",
    { requiredForClient: true },
) {}

export const layerArticlesListQueryMiddleware = HttpApiMiddleware.layerClient(
    ArticlesListQueryMiddleware,
    graphqlBodyMiddleware(articlesQuery(false)) as never,
)

export const layerArticlesWithContentQueryMiddleware =
    HttpApiMiddleware.layerClient(
        ArticlesWithContentQueryMiddleware,
        graphqlBodyMiddleware(articlesQuery(true)) as never,
    )

export const layerArticlesPreviewQueryMiddleware =
    HttpApiMiddleware.layerClient(
        ArticlesPreviewQueryMiddleware,
        graphqlBodyMiddleware(articlesQuery(false), { first: 3 }) as never,
    )
