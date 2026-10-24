import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { HttpClient, HttpClientRequest, HttpClientResponse } from "effect/http"
import { v1Ops } from "@crh/domain/upstream/v1"
import { USER_AGENT, withUserAgent } from "./user-agent"

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

        expect(userAgentOf(requests[0]!)).toBe(USER_AGENT)
    })
})

describe("v1 client", () => {
    it("sends the identifying User-Agent on a leaderboard read", async () => {
        const { client, requests } = capturingClient()

        await Effect.runPromise(
            v1Ops(withUserAgent(client)).getLeaderboard("1v1", "eu", 1),
        )

        expect(requests).toHaveLength(1)
        expect(userAgentOf(requests[0]!)).toBe(USER_AGENT)
    })

    it("sends it on a player read as well", async () => {
        const { client, requests } = capturingClient()

        await Effect.runPromise(
            v1Ops(withUserAgent(client)).getPlayerStats(1234, "all"),
        )

        expect(requests).toHaveLength(1)
        expect(userAgentOf(requests[0]!)).toBe(USER_AGENT)
    })

    it("sends it on a player teams read", async () => {
        const { client, requests } = capturingClient()

        await Effect.runPromise(
            v1Ops(withUserAgent(client)).getPlayerTeams(1234),
        )

        expect(requests).toHaveLength(1)
        expect(userAgentOf(requests[0]!)).toBe(USER_AGENT)
    })
})
