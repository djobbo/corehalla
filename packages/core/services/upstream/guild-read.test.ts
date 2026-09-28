import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import type { Context } from "effect"
import {
    HttpClient,
    HttpClientResponse,
} from "effect/unstable/http"
import { Database } from "../archive"
import { Upstream, rawLayer } from "./index"

/**
 * How many upstream requests a player read costs.
 *
 * The count is the whole point. A profile read assembles the clan card, which
 * is a second request (`/v1/player/guild`) plus a look at our own clan XP, and
 * the request path therefore *should* pay it. The crawl path must not: it
 * writes the career stats, the legends and the weapons into the archive, and
 * `upsertPlayerStats` discards `clan` entirely — so the guild read was a request
 * per crawled player spent on a value that was thrown away.
 *
 * That was not a rounding error. A ladder pass went from ~2,530 requests to
 * ~4,030, a third again as long, which is what ran the crawl's single serialised
 * consumer past a full invocation's worth of work per interval and turned the
 * queue's backlog into a straight line. These assertions exist so the option
 * cannot quietly stop being passed, or quietly become the default for profiles.
 */

/** A player payload complete enough for `isCompletePlayerStats` to accept. */
const playerPayload = {
    brawlhalla_id: 1,
    name: "Player",
    games: 10,
    wins: 5,
    xp: 100,
    level: 9,
    xp_percentage: 1,
    legends: [],
}

const guildPayload = {
    brawlhalla_id: 1,
    guild: {
        guild_id: 9,
        guild_name: "Nine",
        personal_xp: 5,
        join_date: 1,
        rank: "Leader",
    },
}

/** A client that answers by path and records the URLs it was asked for. */
const recordingClient = () => {
    const urls: string[] = []

    const client = HttpClient.make((request) =>
        Effect.sync(() => {
            urls.push(request.url)

            const body = request.url.includes("/player/guild")
                ? guildPayload
                : playerPayload

            return HttpClientResponse.fromWeb(
                request,
                new Response(JSON.stringify(body), {
                    status: 200,
                    headers: { "content-type": "application/json" },
                }),
            )
        }),
    )

    return { client, urls }
}

const database = Layer.succeed(Database, {
    getClanXp: () => Effect.succeed("1234"),
} as unknown as Context.Service.Shape<typeof Database>)

const readPlayer = (options?: { readonly withClan?: boolean }) =>
    Effect.gen(function* () {
        const upstream = yield* Upstream

        return yield* upstream.getPlayerStats(1, options)
    })

const withClient = (client: HttpClient.HttpClient) =>
    rawLayer.pipe(
        Layer.provide(Layer.succeed(HttpClient.HttpClient, client)),
        Layer.provide(database),
    )

describe("the guild read on a player fetch", () => {
    it.effect("is skipped when the caller does not want the clan", () =>
        Effect.gen(function* () {
            const { client, urls } = recordingClient()

            const stats = yield* readPlayer({ withClan: false }).pipe(
                Effect.provide(withClient(client)),
            )

            // One request: the career stats and nothing else.
            expect(urls).toHaveLength(1)
            expect(urls[0]).toContain("/player/stats")

            // And no clan on the value, so a caller could not be misled into
            // caching a card-less read as a complete profile.
            expect(stats?.clan).toBeUndefined()
        }),
    )

    it.effect("still happens for a caller that wants the clan", () =>
        Effect.gen(function* () {
            const { client, urls } = recordingClient()

            const stats = yield* readPlayer().pipe(
                Effect.provide(withClient(client)),
            )

            expect(urls).toHaveLength(2)
            expect(urls[0]).toContain("/player/stats")
            expect(urls[1]).toContain("/player/guild")

            // The card is real, not a placeholder: `clan_xp` is read from our
            // own row, which is why the request path pays for this at all.
            expect(stats?.clan?.clan_name).toBe("Nine")
            expect(stats?.clan?.clan_xp).toBe("1234")
        }),
    )
})
