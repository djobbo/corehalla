import { describe, expect, it } from "@effect/vitest"
import { routeTree } from "../routeTree.gen"
import {
    legacyRedirect,
    legacyRedirectHref,
    legacyRedirects,
} from "./legacyRedirects"

/** The destinations the live site publishes today. */
const LIVE_TARGETS: Readonly<Record<string, string>> = {
    "/p/$": "/stats/players/$",
    "/c/$": "/stats/guilds/$",
    "/stats/me": "/",
    "/discord": "https://discord.com/invite/eD248ez",
    "/wiki": "https://brawlhalla.wiki.gg",
    "/github": "https://github.com/djobbo/corehalla",
    "/twitter": "https://twitter.com/Corehalla",
    "/kofi": "https://ko-fi.com/corehalla",
    "/donate": "https://ko-fi.com/corehalla",
}

type RouteOptions = {
    readonly path?: string | undefined
    readonly beforeLoad?: unknown
    readonly component?: unknown
}

type RouteNode = {
    readonly options?: RouteOptions | undefined
    readonly children?: readonly RouteNode[] | undefined
}

const joinPath = (parent: string, path: string): string => {
    if (path === "/") return parent
    if (!parent || parent === "/") return path

    return `${parent.replace(/\/$/, "")}${path}`
}

/** Every route the generated tree registers, keyed on its full path pattern. */
const generatedRoutes = (): ReadonlyMap<string, RouteOptions> => {
    const routes = new Map<string, RouteOptions>()

    const walk = (route: RouteNode, parent: string) => {
        const options = route.options ?? {}
        const full = joinPath(parent, options.path ?? "")

        if (full) routes.set(full.replace(/\/$/, "") || "/", options)

        for (const child of route.children ?? []) walk(child, full)
    }

    walk(routeTree as unknown as RouteNode, "")

    return routes
}

describe("legacy redirects", () => {
    it("keeps the live destination and a 308 status for every entry", () => {
        for (const redirect of legacyRedirects) {
            expect(LIVE_TARGETS[redirect.path]).toBeDefined()
            expect(redirect.target).toBe(LIVE_TARGETS[redirect.path])
            expect(redirect.status).toBe(308)
        }
    })

    it("covers every live path exactly once", () => {
        const paths = legacyRedirects.map((redirect) => redirect.path)

        expect([...paths].sort()).toEqual(Object.keys(LIVE_TARGETS).sort())
        expect(new Set(paths).size).toBe(paths.length)
    })

    it("carries the incoming segment through a splat entry", () => {
        expect(legacyRedirectHref(legacyRedirect("/p/$"), "1234-boomie")).toBe(
            "/stats/players/1234-boomie",
        )
        expect(legacyRedirectHref(legacyRedirect("/c/$"), "9-the-guild")).toBe(
            "/stats/guilds/9-the-guild",
        )
    })

    it("leaves a fixed target alone", () => {
        expect(legacyRedirectHref(legacyRedirect("/stats/me"), "ignored")).toBe(
            "/",
        )
        expect(legacyRedirectHref(legacyRedirect("/discord"), "ignored")).toBe(
            "https://discord.com/invite/eD248ez",
        )
    })

    it("registers a route for every table entry", () => {
        const routes = generatedRoutes()
        const missing = legacyRedirects.filter(
            (redirect) => !routes.has(redirect.path),
        )

        expect(missing.map((redirect) => redirect.path)).toEqual([])
    })

    it("points each entry at a redirect stub, never at a page", () => {
        const routes = generatedRoutes()
        const shadowed = legacyRedirects.filter((redirect) => {
            const options = routes.get(redirect.path)

            return (
                options?.beforeLoad === undefined ||
                options.component !== undefined
            )
        })

        expect(shadowed.map((redirect) => redirect.path)).toEqual([])
    })
})
