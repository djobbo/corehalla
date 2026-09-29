import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Schema } from "effect"
import { HttpRouter, HttpServer } from "effect/unstable/http"
import {
    HttpApi,
    HttpApiBuilder,
    HttpApiEndpoint,
    HttpApiGroup,
    HttpApiScalar,
} from "effect/unstable/httpapi"

/**
 * The docs route, mounted the way `server.ts` mounts it.
 *
 * The composition under test is the one thing about the reference page that can
 * fail silently: `toWebHandler` supplies the router, and the API and the Scalar
 * page are *merged* rather than nested, so a mistake there produces a server
 * that serves JSON and 404s `/api/v1/docs`. A tiny API stands in for the real
 * contract — the merge is the subject, not the routes — so this pins that both
 * halves survive the merge.
 */
const Ping = HttpApiGroup.make("ping").add(
    HttpApiEndpoint.get("ping", "/api/v1/ping", {
        success: Schema.String,
    }),
)

const TestApi = HttpApi.make("TestApi").add(Ping)

const PingGroup = HttpApiBuilder.group(TestApi, "ping", (handlers) =>
    handlers.handle("ping", () => Effect.succeed("pong")),
)

const AppLayer = Layer.mergeAll(
    HttpApiBuilder.layer(TestApi).pipe(
        Layer.provide(PingGroup),
        Layer.provide(HttpServer.layerServices),
    ),
    HttpApiScalar.layerCdn(TestApi, { path: "/api/v1/docs" }),
)

describe("Scalar docs mounting", () => {
    it("serves the API and the reference from one handler", async () => {
        const { handler } = HttpRouter.toWebHandler(AppLayer)

        const ping = await handler(new Request("http://api.local/api/v1/ping"))
        expect(ping.status).toBe(200)
        expect(await ping.text()).toBe('"pong"')

        const docs = await handler(
            new Request("http://api.local/api/v1/docs"),
        )
        expect(docs.status).toBe(200)

        const html = await docs.text()
        expect(html).toContain("Scalar")
        expect(html).toContain("/api/v1/ping")
    })
})
