import { describe, expect, it } from "@effect/vitest"
import { Effect, Exit } from "effect"
import { legendFiles, legendPageUrl, parseIcons, parseSplash } from "./roster"

describe("roster icons", () => {
    it.effect("reads legend names and image urls", () =>
        Effect.gen(function* () {
            const icons = yield* parseIcons(`
                <a href="/legends/qinghua-baobao">
                    <div class="legend-icon">
                        <img alt="Qinghua &amp; Baobao" src="https://cms.brawlhalla.com/qinghua.png">
                    </div>
                </a>
                <a href="/legends/bodvar">
                    <div class="legend-icon">
                        <img alt="Bödvar" src="https://cms.brawlhalla.com/bodvar.png">
                    </div>
                </a>
            `)

            expect(icons).toEqual([
                {
                    name: "Qinghua & Baobao",
                    src: "https://cms.brawlhalla.com/qinghua.png",
                    page: "/legends/qinghua-baobao",
                },
                {
                    name: "Bödvar",
                    src: "https://cms.brawlhalla.com/bodvar.png",
                    page: "/legends/bodvar",
                },
            ])
        }),
    )

    it.effect("maps page names onto roster image file names", () =>
        Effect.gen(function* () {
            const files = yield* legendFiles([
                {
                    name: "Bödvar",
                    src: "https://cms.brawlhalla.com/bodvar.png",
                    page: "/legends/bodvar",
                },
                {
                    name: "Qinghua & Baobao",
                    src: "https://cms.brawlhalla.com/qinghua.png",
                    page: "/legends/qinghua-baobao",
                },
            ])

            expect(files.map((file) => file.fileName)).toEqual([
                "bodvar",
                "qinghua & baobao",
            ])
        }),
    )

    it.effect("fails when the page has no legend icons", () =>
        Effect.gen(function* () {
            const exit = yield* Effect.exit(legendFiles([]))
            expect(Exit.isFailure(exit)).toBe(true)
        }),
    )

    it.effect("fails when a page name is not in the roster", () =>
        Effect.gen(function* () {
            const exit = yield* Effect.exit(
                legendFiles([
                    {
                        name: "Not A Legend",
                        src: "https://cms.brawlhalla.com/missing.png",
                        page: "/legends/not-a-legend",
                    },
                ]),
            )
            expect(Exit.isFailure(exit)).toBe(true)
        }),
    )

    it.effect("fails when a legend icon has no page", () =>
        Effect.gen(function* () {
            const exit = yield* Effect.exit(
                parseIcons(`
                    <div class="legend-icon">
                        <img alt="Bödvar" src="https://cms.brawlhalla.com/bodvar.png">
                    </div>
                `),
            )
            expect(Exit.isFailure(exit)).toBe(true)
        }),
    )
})

describe("roster splash", () => {
    it.effect("reads the legend splash image", () =>
        Effect.gen(function* () {
            const src = yield* parseSplash(`
                <aside>
                    <img class="splash svelte-171b0c4" src="https://cms.brawlhalla.com/c/uploads/2022/02/BodvarSplash-1.png" alt="Bödvar Splash Art">
                </aside>
                <img alt="Legend splash" class="layer-2" src="/_app/immutable/assets/play-overlay-bg.png">
            `)

            expect(src).toBe(
                "https://cms.brawlhalla.com/c/uploads/2022/02/BodvarSplash-1.png",
            )
        }),
    )

    it.effect("fails when the page has no splash image", () =>
        Effect.gen(function* () {
            const exit = yield* Effect.exit(
                parseSplash(
                    `<img alt="Legend splash" src="https://cms.brawlhalla.com/overlay.png">`,
                ),
            )
            expect(Exit.isFailure(exit)).toBe(true)
        }),
    )

    it.effect("builds a legend page url from the index link", () =>
        Effect.sync(() => {
            expect(legendPageUrl("/legends/bodvar")).toBe(
                "https://www.brawlhalla.com/legends/bodvar",
            )
        }),
    )
})
