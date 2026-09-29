import { describe, expect, it } from "@effect/vitest"
import { OpenApi } from "effect/unstable/httpapi"
import { CorehallaApi } from "@crh/api-contract/Api"

/**
 * The generated OpenAPI document.
 *
 * It is easy to add an endpoint whose response schema is a `Schema.declare`
 * passthrough and never notice: the route works, the typed client works, and
 * the only symptom is a reference page that shows `unknown` for it. These
 * assertions pin the two properties that make `/api/v1/docs` worth opening —
 * the paths exist, and the aggregate paths describe real object schemas.
 */
describe("OpenAPI document", () => {
    const spec = OpenApi.fromApi(CorehallaApi)
    const paths = Object.keys(spec.paths)

    it("publishes the aggregate paths", () => {
        expect(paths).toContain("/api/v1/players/{playerId}")
        expect(paths).toContain("/api/v1/guilds/{guildId}")
        expect(paths).toContain("/api/v1/rankings/1v1")
        expect(paths).toContain("/api/v1/search")
    })

    it("keeps the raw Brawlhalla surface under one prefix", () => {
        expect(paths).toContain(
            "/api/v1/upstream/brawlhalla/player/{playerId}/stats",
        )
        expect(paths).toContain("/api/v1/upstream/brawlhalla/clan/{clanId}")
    })

    it("describes the player payload as an object, not an unknown", () => {
        const response =
            spec.paths["/api/v1/players/{playerId}"]?.get?.responses["200"]

        const schema = response?.content?.["application/json"]?.schema

        // The envelope is a `$ref` to the named `PlayerEnvelope`-ish schema, or
        // an inline object; either way it must not be the open `{}` a
        // passthrough produces.
        expect(schema).toBeDefined()
        expect(JSON.stringify(schema)).not.toBe("{}")
    })

    it("tags each group", () => {
        /*
         * A path item's values are a mix of operations and shared parameter
         * arrays, and only the operations carry tags. The cast is the honest
         * way to say "read the field if this value is an operation" without
         * re-deriving the spec's own union.
         */
        const tags = new Set(
            Object.values(spec.paths).flatMap((path) =>
                Object.values(path).flatMap(
                    (operation) =>
                        (operation as { tags?: readonly string[] } | undefined)
                            ?.tags ?? [],
                ),
            ),
        )

        expect(tags).toContain("players")
        expect(tags).toContain("guilds")
        expect(tags).toContain("upstream")
    })
})
