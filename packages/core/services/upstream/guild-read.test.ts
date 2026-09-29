import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import type { Context } from "effect"
import { HttpClient, HttpClientResponse } from "effect/unstable/http"
import { Database } from "../archive"
import { Upstream, rawLayer } from "./index"

/**
 * How many upstream requests a player read costs, and where the clan card
 * comes from.
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
 * queue's backlog into a straight line.
 *
 * The split into two methods is what keeps both properties *and* makes the
 * cache warmable: `getPlayerStats` is exactly what the crawler fetches, so the
 * crawler can store it verbatim, and `getPlayerClan` is fetched only where a
 * card is actually rendered. These assertions exist so the two cannot quietly
 * be merged back into one read that either costs the crawler a request or
 * serves a clan-less entry as a complete profile.
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

const readStats = () =>
    Effect.gen(function* () {
        const upstream = yield* Upstream

        return yield* upstream.getPlayerStats(1)
    })

const readClan = () =>
    Effect.gen(function* () {
        const upstream = yield* Upstream

        return yield* upstream.getPlayerClan(1)
    })

const withClient = (client: HttpClient.HttpClient) =>
    rawLayer.pipe(
        Layer.provide(Layer.succeed(HttpClient.HttpClient, client)),
        Layer.provide(database),
    )

describe("the guild read on a player fetch", () => {
    it.effect("the career read is one request and carries no clan", () =>
        Effect.gen(function* () {
            const { client, urls } = recordingClient()

            const stats = yield* readStats().pipe(
                Effect.provide(withClient(client)),
            )

            // One request: the career stats and nothing else.
            expect(urls).toHaveLength(1)
            expect(urls[0]).toContain("/player/stats")

            // And no clan on the value, so a crawler cannot warm the profile's
            // stats entry with a card-less read and have it served as complete.
            expect(stats?.clan).toBeUndefined()
        }),
    )

    it.effect("the clan card is its own request, priced separately", () =>
        Effect.gen(function* () {
            const { client, urls } = recordingClient()

            const clan = yield* readClan().pipe(
                Effect.provide(withClient(client)),
            )

            expect(urls).toHaveLength(1)
            expect(urls[0]).toContain("/player/guild")

            // The card is real, not a placeholder: `clan_xp` is read from our
            // own row, which is why the profile path pays for this at all.
            expect(clan?.clan_name).toBe("Nine")
            expect(clan?.clan_xp).toBe("1234")
        }),
    )

    it.effect("a profile pays for both, and the crawler for one", () =>
        Effect.gen(function* () {
            const { client, urls } = recordingClient()

            const profile = yield* Effect.all([readStats(), readClan()], {
                concurrency: 2,
            }).pipe(Effect.provide(withClient(client)))

            expect(urls).toHaveLength(2)
            expect(urls.filter((url) => url.includes("/player/stats"))).toHaveLength(1)
            expect(urls.filter((url) => url.includes("/player/guild"))).toHaveLength(1)

            // The two halves compose into the payload the profile renders.
            expect(profile[0]?.clan).toBeUndefined()
            expect(profile[1]?.clan_id).toBe(9)
        }),
    )
})
