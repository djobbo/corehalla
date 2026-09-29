import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import type { Context } from "effect"
import { HttpClient, HttpClientResponse } from "effect/unstable/http"
import { Database } from "../archive"
import { Upstream, rawLayer } from "./index"

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
            expect(
                urls.filter((url) => url.includes("/player/stats")),
            ).toHaveLength(1)
            expect(
                urls.filter((url) => url.includes("/player/guild")),
            ).toHaveLength(1)

            expect(profile[0]?.clan).toBeUndefined()
            expect(profile[1]?.clan_id).toBe(9)
        }),
    )
})
