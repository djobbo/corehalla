import { weapons } from "@crh/bhapi/constants"
import { legends } from "@crh/bhapi/legends"
import { legendHref } from "./legends"
import { brackets, ladderHref, regions } from "./rankings"
import { weaponHref } from "./weapons"

const PLACEHOLDER_ORIGIN = "https://corehalla.com"
const SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9"

const prefixedPaths = (prefix: string, slugs: readonly string[]): string[] =>
    slugs
        .map((slug) => slug.trim())
        .filter((slug) => slug.length > 0)
        .map((slug) => `${prefix}${slug}`)

/**
 * Every canonical, indexable page the app renders. Paginated boards, private
 * `/@me` pages and the redirect-only legacy paths stay out.
 */
export const sitemapPaths = (): readonly string[] => {
    const paths = [
        "/",
        "/news",
        "/updates",
        ...brackets.flatMap((bracket) =>
            regions.map((region) => ladderHref(bracket, region.value)),
        ),
        "/rankings/power/1v1",
        "/rankings/power/2v2",
        "/rankings/clans",
        "/rankings/guilds",
        "/rankings/career/players",
        "/rankings/career/legends",
        "/rankings/career/weapons",
        ...legends.map(
            (legend) => `/rankings/career/legends/${legend.legend_id}`,
        ),
        ...weapons.map(
            (weapon) =>
                `/rankings/career/weapons/${encodeURIComponent(weapon)}`,
        ),
        "/legends",
        ...legends.map(legendHref),
        "/weapons",
        ...weapons.map(weaponHref),
        "/tiers",
        "/daily",
        "/calc",
        "/vs",
        "/privacy",
    ]

    return [...new Set(paths)]
}

/** `/news/<slug>` and `/updates/<slug>` for the lists the article endpoints return. */
export const articlePaths = (
    news: readonly string[],
    updates: readonly string[],
): readonly string[] => [
    ...new Set([
        ...prefixedPaths("/news/", news),
        ...prefixedPaths("/updates/", updates),
    ]),
]

export const normalizeOrigin = (url?: string): string => {
    const origin = url?.trim().replace(/\/+$/, "")

    return origin === undefined || origin.length === 0
        ? PLACEHOLDER_ORIGIN
        : origin
}

const escapeXml = (value: string): string =>
    value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")

export const renderSitemap = (
    origin: string,
    paths: readonly string[],
    lastmod?: string,
): string => {
    const base = normalizeOrigin(origin)
    const urls = paths
        .map((path) => {
            const lastModified =
                lastmod === undefined
                    ? ""
                    : `<lastmod>${escapeXml(lastmod)}</lastmod>`

            return `<url><loc>${escapeXml(`${base}${path}`)}</loc>${lastModified}</url>`
        })
        .join("")

    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="${SITEMAP_NAMESPACE}">${urls}</urlset>`
}

export const renderRobots = (origin: string): string =>
    [
        "User-agent: *",
        "Allow: /",
        "Disallow: /@me/",
        "",
        `Sitemap: ${normalizeOrigin(origin)}/sitemap.xml`,
        "",
    ].join("\n")
