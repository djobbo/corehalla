import { NextResponse } from "next/server"
import type { NextMiddleware } from "next/server"

const BRAWLHALLA_WIKI_URL = "https://brawlhalla.fandom.com/wiki/Brawlhalla_Wiki"
const COREHALLA_DISCORD_URL = "https://discord.com/invite/eD248ez"
const COREHALLA_GITHUB_URL = "https://github.com/djobbo/corehalla"
const COREHALLA_TWITTER_URL = "https://twitter.com/Corehalla"

const handler: NextMiddleware = (req) => {
    if (req.nextUrl.pathname.startsWith("/wiki")) {
        return NextResponse.redirect(BRAWLHALLA_WIKI_URL)
    }

    if (req.nextUrl.pathname.startsWith("/discord")) {
        return NextResponse.redirect(COREHALLA_DISCORD_URL)
    }

    if (req.nextUrl.pathname.startsWith("/github")) {
        return NextResponse.redirect(COREHALLA_GITHUB_URL)
    }

    if (req.nextUrl.pathname.startsWith("/twitter")) {
        return NextResponse.redirect(COREHALLA_TWITTER_URL)
    }

    if (req.nextUrl.pathname === "/rankings") {
        const url = req.nextUrl.clone()
        url.pathname = "/rankings/1v1"
        return NextResponse.redirect(url)
    }

    if (req.nextUrl.pathname.startsWith("/leaderboard")) {
        const url = req.nextUrl.clone()
        url.pathname = url.pathname.replace("/leaderboard", "/rankings")
        return NextResponse.redirect(url)
    }

    if (req.nextUrl.pathname.startsWith("/p/")) {
        const url = req.nextUrl.clone()
        url.pathname = url.pathname.replace("/p/", "/stats/player/")
        return NextResponse.redirect(url)
    }

    if (req.nextUrl.pathname.startsWith("/c/")) {
        const url = req.nextUrl.clone()
        url.pathname = url.pathname.replace("/c/", "/stats/clan/")
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export default handler
