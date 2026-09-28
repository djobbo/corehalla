import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import {
    HttpClient,
    HttpClientRequest,
    HttpClientResponse,
} from "effect/unstable/http"
import { legacyOps } from "./legacy"
import { v1Ops } from "./v1"
import { USER_AGENT, withUserAgent } from "./user-agent"

/**
 * The identifying `User-Agent`.
 *
 * Effect's fetch client sends none, so without this the crawler is an anonymous
 * client making a few thousand requests an hour — the first thing a provider
 * blocks. These assertions exist so the header cannot quietly disappear from one
 * of the two client construction points.
 */

/** A client that records the requests it is asked to send and answers `{}`. */
export const capturingClient = () => {
    const requests: HttpClientRequest.HttpClientRequest[] = []

    const client = HttpClient.make((request) =>
        Effect.sync(() => {
            requests.push(request)

            return HttpClientResponse.fromWeb(
                request,
                new Response("{}", {
                    status: 200,
                    headers: { "content-type": "application/json" },
                }),
            )
        }),
    )

    return { client, requests }
}

const userAgentOf = (request: HttpClientRequest.HttpClientRequest) =>
    request.headers["user-agent"]

describe("withUserAgent", () => {
    it("sets the identifying header on every request", async () => {
        const { client, requests } = capturingClient()

        await Effect.runPromise(
            withUserAgent(client).get("https://api.brawlhalla.com/v1/x"),
        )

        expect(requests).toHaveLength(1)

        const agent = userAgentOf(requests[0]!)

        expect(agent).toBe(USER_AGENT)
        // The identity has to be actionable: a project name and somewhere to
        // read about it, not a bare token like "node-fetch".
        expect(agent).toContain("Corehalla")
        expect(agent).toContain("https://corehalla.com")
    })

    it("replaces a caller-supplied User-Agent rather than appending", async () => {
        const { client, requests } = capturingClient()

        await Effect.runPromise(
            withUserAgent(client).execute(
                HttpClientRequest.get("https://api.brawlhalla.com/v1/x").pipe(
                    HttpClientRequest.setHeader("User-Agent", "some-other/9"),
                ),
            ),
        )

        // A single value, not `some-other/9, Corehalla/1.0`: two identities in
        // one header is worse than none, because neither can be acted on.
        expect(userAgentOf(requests[0]!)).toBe(USER_AGENT)
    })
})

describe("v1 client", () => {
    it("sends the identifying User-Agent on a leaderboard read", async () => {
        const { client, requests } = capturingClient()

        await Effect.runPromise(v1Ops(client).getLeaderboard("1v1", "eu", 1))

        expect(requests).toHaveLength(1)
        expect(userAgentOf(requests[0]!)).toBe(USER_AGENT)
    })

    it("sends it on a player read as well", async () => {
        const { client, requests } = capturingClient()

        await Effect.runPromise(v1Ops(client).getPlayerStats(1234, "all"))

        expect(requests).toHaveLength(1)
        expect(userAgentOf(requests[0]!)).toBe(USER_AGENT)
    })
})

describe("legacy v0 client", () => {
    it("sends the identifying User-Agent on a rankings read", async () => {
        // `legacyOps` attaches the API key on every request, and the key
        // resolver reads `process.env` before the Worker bindings. Stubbing it
        // here keeps the assertion about the header rather than about secrets.
        process.env["BRAWLHALLA_API_KEY"] = "test-key"

        try {
            const { client, requests } = capturingClient()

            await Effect.runPromise(
                legacyOps(client).getRankings("1v1", "eu", 1),
            )

            expect(requests.length).toBeGreaterThan(0)
            expect(userAgentOf(requests[0]!)).toBe(USER_AGENT)
        } finally {
            delete process.env["BRAWLHALLA_API_KEY"]
        }
    })
})
