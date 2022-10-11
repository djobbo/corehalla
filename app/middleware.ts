import { NextResponse } from "next/server"
import type { NextMiddleware } from "next/server"

const handler: NextMiddleware = (req) => {
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
