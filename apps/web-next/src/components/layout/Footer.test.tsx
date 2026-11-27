import { describe, expect, it } from "@effect/vitest"
import {
    RouterContextProvider,
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
} from "@tanstack/react-router"
import { renderToStaticMarkup } from "react-dom/server"
import { Footer } from "./Footer"

const renderFooter = (): string => {
    const rootRoute = createRootRoute()
    const router = createRouter({
        routeTree: rootRoute.addChildren([
            createRoute({ getParentRoute: () => rootRoute, path: "/" }),
            createRoute({ getParentRoute: () => rootRoute, path: "/privacy" }),
        ]),
        history: createMemoryHistory({ initialEntries: ["/"] }),
    })

    return renderToStaticMarkup(
        <RouterContextProvider router={router}>
            <Footer year={2026} />
        </RouterContextProvider>,
    )
}

const anchorFor = (markup: string, label: string): string => {
    const anchor = markup.match(new RegExp(`<a\\b[^>]*>${label}</a>`))?.[0]

    expect(anchor).toBeDefined()

    return anchor ?? ""
}

describe("Footer", () => {
    it("navigates to the privacy policy client-side", () => {
        const privacy = anchorFor(renderFooter(), "Privacy Policy")

        expect(privacy).toContain('href="/privacy"')
        expect(privacy).not.toContain('target="_blank"')
    })

    it("opens the Brawlhalla Wiki in a new tab", () => {
        const wiki = anchorFor(renderFooter(), "Brawlhalla Wiki")

        expect(wiki).toContain('href="https://brawlhalla.wiki.gg"')
        expect(wiki).toContain('target="_blank"')
        expect(wiki).toContain('rel="noreferrer"')
    })

    it("keeps the community links and the copyright", () => {
        const markup = renderFooter()

        expect(anchorFor(markup, "Discord")).toContain(
            'href="https://discord.com/invite/eD248ez"',
        )
        expect(markup).toContain("© 2018-2026 Corehalla")
    })
})
