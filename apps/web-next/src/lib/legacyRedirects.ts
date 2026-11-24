export type LegacyRedirect = {
    readonly path: string
    readonly target: string
    readonly status: number
}

/**
 * Paths the live site publishes that no longer have a page of their own.
 *
 * `/p` and `/c` carry the entity slug in a splat, written as a trailing `$` in
 * the target; everything else is a fixed destination matching
 * `apps/web/src/routes`. A path that also exists under `src/routes` here must
 * not appear — `legacyRedirects.test.ts` fails if one does.
 */
export const legacyRedirects: readonly LegacyRedirect[] = [
    { path: "/p/$", target: "/stats/players/$", status: 308 },
    { path: "/c/$", target: "/stats/guilds/$", status: 308 },
    { path: "/stats/me", target: "/", status: 308 },
    {
        path: "/discord",
        target: "https://discord.com/invite/eD248ez",
        status: 308,
    },
    { path: "/wiki", target: "https://brawlhalla.wiki.gg", status: 308 },
    {
        path: "/github",
        target: "https://github.com/djobbo/corehalla",
        status: 308,
    },
    { path: "/twitter", target: "https://twitter.com/Corehalla", status: 308 },
    { path: "/kofi", target: "https://ko-fi.com/corehalla", status: 308 },
    { path: "/donate", target: "https://ko-fi.com/corehalla", status: 308 },
]

export const legacyRedirect = (path: string): LegacyRedirect => {
    const redirect = legacyRedirects.find((entry) => entry.path === path)

    if (!redirect) throw new Error(`No legacy redirect for ${path}`)

    return redirect
}

/** Fills a splat target's `$` with the segment the request brought. */
export const legacyRedirectHref = (
    redirect: LegacyRedirect,
    splat?: string,
): string => redirect.target.replace(/\$$/, splat ?? "")
