import { describe, expect, it } from "@effect/vitest"
import { Effect, Exit } from "effect"
import { legendFiles, parseIcons } from "./roster"

describe("roster icons", () => {
    it.effect("reads legend names and image urls", () =>
        Effect.gen(function* () {
            const icons = yield* parseIcons(`
                <div class="legend-icon">
                    <img alt="Qinghua &amp; Baobao" src="https://cms.brawlhalla.com/qinghua.png">
                </div>
                <div class="legend-icon">
                    <img alt="Bödvar" src="https://cms.brawlhalla.com/bodvar.png">
                </div>
            `)

            expect(icons).toEqual([
                {
                    name: "Qinghua & Baobao",
                    src: "https://cms.brawlhalla.com/qinghua.png",
                },
                {
                    name: "Bödvar",
                    src: "https://cms.brawlhalla.com/bodvar.png",
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
                },
                {
                    name: "Qinghua & Baobao",
                    src: "https://cms.brawlhalla.com/qinghua.png",
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
                    },
                ]),
            )
            expect(Exit.isFailure(exit)).toBe(true)
        }),
    )
})
