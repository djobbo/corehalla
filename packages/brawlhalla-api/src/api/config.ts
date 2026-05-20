import * as Context from "effect/Context"
import type * as Redacted from "effect/Redacted"

import { BRAWLHALLA_API_BASE_URL } from "./definition.js"

export class BrawlhallaApiConfig extends Context.Service<
    BrawlhallaApiConfig,
    {
        readonly apiKey: Redacted.Redacted<string>
        readonly baseUrl: string
    }
>()("BrawlhallaApiConfig") {
    static readonly defaultBaseUrl = BRAWLHALLA_API_BASE_URL
}
