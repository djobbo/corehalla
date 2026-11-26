import { describe, expect, it } from "@effect/vitest"
import { legends } from "@crh/bhapi/legends"
import { weapons } from "@crh/bhapi/constants"
import { brackets, regions } from "./rankings"
import { resolveLegendId, resolveWeapon } from "./routeParams"
import {
    articlePaths,
    normalizeOrigin,
    renderRobots,
    renderSitemap,
    sitemapPaths,
} from "./sitemap"

describe("sitemapPaths", () => {
    it("lists unique root-relative paths", () => {
        const paths = sitemapPaths()

        expect(new Set(paths).size).toBe(paths.length)
        expect(paths.every((path) => path.startsWith("/"))).toBe(true)
    })

    it("includes the landing, news and updates pages", () => {
        const paths = sitemapPaths()

        expect(paths).toContain("/")
        expect(paths).toContain("/news")
        expect(paths).toContain("/updates")
    })

    it("includes every live ladder at page one", () => {
        const ladderPaths = sitemapPaths().filter((path) =>
            path.startsWith("/rankings/live/"),
        )

        expect(ladderPaths).toHaveLength(brackets.length * regions.length)
        expect(ladderPaths).toContain("/rankings/live/1v1/eu")
        expect(ladderPaths).not.toContain("/rankings/live/1v1/eu/2")
    })

    it("includes the power, clan and career boards", () => {
        const paths = sitemapPaths()

        expect(paths).toContain("/rankings/power/1v1")
        expect(paths).toContain("/rankings/power/2v2")
        expect(paths).toContain("/rankings/clans")
        expect(paths).toContain("/rankings/guilds")
        expect(paths).toContain("/rankings/career/players")
        expect(paths).toContain("/rankings/career/legends")
        expect(paths).toContain("/rankings/career/weapons")
    })

    it("includes one path per legend and one per weapon", () => {
        const paths = sitemapPaths()

        expect(
            paths.filter((path) =>
                path.startsWith("/rankings/career/legends/"),
            ),
        ).toHaveLength(legends.length)
        expect(
            paths.filter((path) =>
                path.startsWith("/rankings/career/weapons/"),
            ),
        ).toHaveLength(weapons.length)
    })

    it("includes the legend index and one page per legend", () => {
        const paths = sitemapPaths()
        const legendPaths = paths.filter((path) => path.startsWith("/legends/"))

        expect(paths).toContain("/legends")
        expect(legendPaths).toHaveLength(legends.length)
        expect(new Set(legendPaths).size).toBe(legendPaths.length)
    })

    it("includes the weapon index and one page per weapon", () => {
        const paths = sitemapPaths()
        const weaponPaths = paths.filter((path) => path.startsWith("/weapons/"))

        expect(paths).toContain("/weapons")
        expect(weaponPaths).toHaveLength(weapons.length)
        expect(new Set(weaponPaths).size).toBe(weaponPaths.length)
        expect(weaponPaths).toContain("/weapons/grapple-hammer")
        expect(weaponPaths).toContain("/weapons/battle-boots")
    })

    it("includes the tier list maker and the daily puzzle", () => {
        const paths = sitemapPaths()

        expect(paths).toContain("/tiers")
        expect(paths).toContain("/daily")
    })

    it("includes the calculator and comparison tools", () => {
        const paths = sitemapPaths()

        expect(paths).toContain("/calc")
        expect(paths).toContain("/vs")
    })

    it("spells legend and weapon paths the way their routes render them", () => {
        const paths = sitemapPaths()

        expect(paths).toContain("/rankings/career/legends/3")
        expect(paths).toContain("/rankings/career/weapons/Grapple%20Hammer")
        expect(resolveLegendId("3")).toBe(3)
        expect(resolveWeapon("Grapple Hammer")).toBe("Grapple Hammer")
    })

    it("omits private pages and paginated boards", () => {
        const paths = sitemapPaths()

        expect(paths).not.toContain("/@me/favorites")
        expect(
            paths.filter(
                (path) =>
                    /\/\d+$/.test(path) &&
                    !path.startsWith("/rankings/career/legends/"),
            ),
        ).toEqual([])
    })
})

describe("renderSitemap", () => {
    it("places one url per path under the sitemap namespace", () => {
        const paths = sitemapPaths()
        const document = renderSitemap("https://corehalla.com", paths)

        expect(document).toContain(
            'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        )
        expect(document.match(/<url>/g)).toHaveLength(paths.length)
        expect(document).toContain("<loc>https://corehalla.com/</loc>")
        expect(document).toContain(
            "<loc>https://corehalla.com/rankings/live/1v1/eu</loc>",
        )
    })

    it("escapes reserved characters in a path", () => {
        const document = renderSitemap("https://corehalla.com", [
            "/news?tag=patch&page=1",
        ])

        expect(document).toContain(
            "<loc>https://corehalla.com/news?tag=patch&amp;page=1</loc>",
        )
        expect(document).not.toContain("&amp;page=1</loc>&")
    })

    it("joins the origin and path with a single slash", () => {
        const document = renderSitemap("https://corehalla.com/", ["/news"])

        expect(document).toContain("<loc>https://corehalla.com/news</loc>")
        expect(document).not.toContain("corehalla.com//news")
    })

    it("adds lastmod to every entry when given", () => {
        const document = renderSitemap(
            "https://corehalla.com",
            ["/", "/news"],
            "2026-11-23",
        )

        expect(document.match(/<lastmod>2026-11-23<\/lastmod>/g)).toHaveLength(
            2,
        )
    })

    it("lists news and update articles as absolute escaped urls", () => {
        const document = renderSitemap("https://corehalla.com", [
            ...sitemapPaths(),
            ...articlePaths(["patch&notes"], ["launch<day>"]),
        ])

        expect(document).toContain(
            "<loc>https://corehalla.com/news/patch&amp;notes</loc>",
        )
        expect(document).toContain(
            "<loc>https://corehalla.com/updates/launch&lt;day&gt;</loc>",
        )
        expect(document).toContain("<loc>https://corehalla.com/calc</loc>")
        expect(document).toContain("<loc>https://corehalla.com/vs</loc>")
    })

    it("keeps every static path when the article lists are empty", () => {
        const staticPaths = sitemapPaths()
        const document = renderSitemap("https://corehalla.com", [
            ...staticPaths,
            ...articlePaths([], []),
        ])

        expect(document.match(/<url>/g)).toHaveLength(staticPaths.length)
        expect(document).toContain(
            "<loc>https://corehalla.com/rankings/clans</loc>",
        )
    })
})

describe("renderRobots", () => {
    it("allows the site, disallows signed-in pages and points at the sitemap", () => {
        const robots = renderRobots("https://corehalla.com")

        expect(robots).toContain("User-agent: *")
        expect(robots).toContain("Allow: /")
        expect(robots).toContain("Disallow: /@me/")
        expect(robots).toContain("Sitemap: https://corehalla.com/sitemap.xml")
    })

    it("keeps a single slash at the join", () => {
        const robots = renderRobots("https://corehalla.com/")

        expect(robots).toContain("Sitemap: https://corehalla.com/sitemap.xml")
        expect(robots).not.toContain("corehalla.com//sitemap.xml")
    })
})

describe("normalizeOrigin", () => {
    it("treats a trailing slash as the same origin", () => {
        expect(normalizeOrigin("https://corehalla.com/")).toBe(
            normalizeOrigin("https://corehalla.com"),
        )
    })

    it("falls back to the placeholder when no origin is configured", () => {
        expect(normalizeOrigin()).toBe("https://corehalla.com")
        expect(normalizeOrigin("   ")).toBe("https://corehalla.com")
    })
})
