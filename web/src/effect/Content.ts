import { Context, Effect, Layer } from "effect"
import {
    getBrawlhallaArticles,
    getWeeklyRotation as getWeeklyRotationFn,
} from "web-parser/common"
import { parsePowerRankingsPage } from "web-parser/power-rankings/parsePowerRankingsPage"
import { ContentError } from "./errors"
import type { BHArticle, BrawlhallaArticleCategory } from "web-parser/common"
import type { Legend } from "bhapi/types"
import type {
    PR,
    PowerRankingsBracket,
    PowerRankingsRegion,
} from "web-parser/power-rankings/parsePowerRankingsPage"

/**
 * Server-side content scraping service.
 *
 * Wraps the `web-parser` scrapers in Effects so they compose with the HTTP API
 * handlers. Failures are defects (HTTP 500), matching the previous behaviour of
 * the tRPC procedures.
 */
export class Content extends Context.Service<
    Content,
    {
        readonly getWeeklyRotation: () => Effect.Effect<readonly Legend[]>
        readonly getArticles: (
            category: BrawlhallaArticleCategory,
            first: number,
        ) => Effect.Effect<readonly BHArticle[]>
        readonly getPowerRankings: (
            bracket: PowerRankingsBracket,
            region: PowerRankingsRegion,
        ) => Effect.Effect<readonly PR[]>
    }
>()("app/Content") {}

const run = <A>(f: () => Promise<A>) =>
    Effect.tryPromise({
        try: f,
        catch: (cause) => new ContentError({ cause }),
    }).pipe(Effect.orDie)

export const layer = Layer.succeed(Content, {
    getWeeklyRotation: () => run(() => getWeeklyRotationFn()),

    getArticles: (category, first) =>
        run(() => getBrawlhallaArticles({ category, first })),

    getPowerRankings: (bracket, region) =>
        run(() => parsePowerRankingsPage(bracket, region)),
})
