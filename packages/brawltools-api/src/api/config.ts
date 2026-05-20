import * as Context from "effect/Context"

import { BRAWLTOOLS_API_BASE_URL } from "./definition.js"

export class BrawltoolsApiConfig extends Context.Service<
    BrawltoolsApiConfig,
    {
        readonly baseUrl: string
        readonly maxResults: number
    }
>()("BrawltoolsApiConfig") {
    static readonly defaultBaseUrl = BRAWLTOOLS_API_BASE_URL
    static readonly defaultMaxResults = 50
}
