import { describe, expect, it } from "@effect/vitest"
import { OpenApi } from "effect/http-api"
import { CorehallaApi } from "@crh/api-contract/Api"

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

        // Must not be the open `{}` a Schema.declare passthrough produces.
        expect(schema).toBeDefined()
        expect(JSON.stringify(schema)).not.toBe("{}")
    })

    it("tags each group", () => {
        // Path-item values mix operations and parameter arrays; only ops have tags.
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
