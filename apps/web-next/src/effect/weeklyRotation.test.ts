import { Effect } from "effect"
import { HttpClient, HttpClientResponse } from "effect/http"
import { describe, expect, it } from "vite-plus/test"
import {
    makeRegistry,
    preloadAtom,
    weeklyRotationAtom,
    weeklyRotationLegendsAtom,
} from "./atoms"
import { useServerHttpClient } from "./client"

const legend = (legendId: number) => ({
    legend_id: legendId,
    legend_name_key: `legend-${legendId}`,
    bio_name: `Legend ${legendId}`,
    bio_aka: "",
    weapon_one: "Sword",
    weapon_two: "Spear",
    strength: "6",
    dexterity: "5",
    defense: "6",
    speed: "5",
})

const rotation = [legend(1), legend(2), legend(3)]

const json = (body: unknown): Response =>
    new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
    })

let answer = (): Response => json(rotation)

useServerHttpClient(
    HttpClient.make((request) =>
        Effect.succeed(HttpClientResponse.fromWeb(request, answer())),
    ),
)

describe("weeklyRotationAtom", () => {
    it("preloads the rotation the server fetch returned", async () => {
        answer = () => json(rotation)

        const registry = makeRegistry()
        await preloadAtom(registry, weeklyRotationAtom())

        expect(registry.get(weeklyRotationLegendsAtom)).toEqual(rotation)
    })

    it("reads as an empty rotation when the fetch fails", async () => {
        answer = () => new Response(null, { status: 500 })

        const registry = makeRegistry()
        await expect(
            preloadAtom(registry, weeklyRotationAtom()),
        ).rejects.toBeDefined()

        expect(registry.get(weeklyRotationLegendsAtom)).toEqual([])
    })
})
