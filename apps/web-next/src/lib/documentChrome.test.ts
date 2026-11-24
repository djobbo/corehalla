import { describe, expect, it } from "@effect/vitest"
import { globSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { SkipLink } from "../components/layout/SkipLink"
import { Route } from "../routes/__root"

const srcRoot = fileURLToPath(new URL("..", import.meta.url))
const stylesheet = readFileSync(`${srcRoot}/styles/app.css`, "utf8")

/** Every page main the root outlet can draw, across routes and layout components. */
const pageMains = (): ReadonlyArray<{
    readonly file: string
    readonly tag: string
}> =>
    globSync("**/*.tsx", { cwd: srcRoot })
        .filter((file) => !file.endsWith(".stories.tsx"))
        .flatMap((file) =>
            (
                readFileSync(`${srcRoot}/${file}`, "utf8").match(
                    /<main\b[^>]*>/g,
                ) ?? []
            )
                .filter((tag) => tag.includes("ch-page"))
                .map((tag) => ({ file, tag })),
        )

describe("document chrome", () => {
    it("declares the canvas colour as the browser theme", () => {
        const head = Route.options.head as unknown as (ctx: {
            readonly matches: readonly unknown[]
        }) => { readonly meta: readonly unknown[] }

        expect(head({ matches: [] }).meta).toContainEqual({
            name: "theme-color",
            content: "#1e212c",
        })
    })

    it("tells the browser the document is dark", () => {
        expect(stylesheet).toMatch(/html\s*\{[^}]*color-scheme:\s*dark/)
    })

    it("renders a skip link that targets the page main", () => {
        const markup = renderToStaticMarkup(createElement(SkipLink))

        expect(markup).toContain('class="ch-skip"')
        expect(markup).toContain('href="#main"')
        expect(markup).toContain("Skip to content")
    })

    it("keeps the skip link off-canvas until it takes focus", () => {
        expect(stylesheet).toMatch(/\.ch-skip\s*\{[^}]*translate/)
        expect(stylesheet).toMatch(/\.ch-skip:focus\s*\{[^}]*transform:\s*none/)
    })

    it("gives every page main the skip target id", () => {
        const mains = pageMains()

        expect(mains.length).toBeGreaterThan(0)

        for (const { file, tag } of mains) {
            expect(`${file}: ${tag}`).toContain('id="main"')
            expect(`${file}: ${tag}`).toContain("tabIndex={-1}")
        }
    })
})
