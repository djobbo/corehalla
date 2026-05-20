import * as Context from "effect/Context"

import { BRAWLHALLA_GQL_BASE_URL } from "./definition.js"

export class BrawlhallaGqlApiConfig extends Context.Service<
    BrawlhallaGqlApiConfig,
    {
        readonly baseUrl: string
    }
>()("BrawlhallaGqlApiConfig") {
    static readonly defaultBaseUrl = BRAWLHALLA_GQL_BASE_URL
}
