import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi"

import { ArticlesResponse } from "../schema/articles.js"
import { PostsVariables } from "../schema/posts-variables.js"
import {
    ArticlesListQueryMiddleware,
    ArticlesPreviewQueryMiddleware,
    ArticlesWithContentQueryMiddleware,
} from "./middleware.js"

export const BRAWLHALLA_GQL_BASE_URL = "https://cms.brawlhalla.com/graphql"

export const BrawlhallaGqlApi = HttpApi.make("BrawlhallaGqlApi").add(
    HttpApiGroup.make("articles").add(
        HttpApiEndpoint.post("list", "/graphql", {
            payload: PostsVariables,
            success: ArticlesResponse,
        }).middleware(ArticlesListQueryMiddleware),
        HttpApiEndpoint.post("withContent", "/graphql", {
            payload: PostsVariables,
            success: ArticlesResponse,
        }).middleware(ArticlesWithContentQueryMiddleware),
        HttpApiEndpoint.post("preview", "/graphql", {
            payload: PostsVariables,
            success: ArticlesResponse,
        }).middleware(ArticlesPreviewQueryMiddleware),
    ),
)
