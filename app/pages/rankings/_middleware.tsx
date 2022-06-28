import { NextResponse } from "next/server"
import type { NextMiddleware } from "next/server"

const handler: NextMiddleware = (req) => {
    if (req.nextUrl.pathname === "/") {
        const url = req.nextUrl.clone()
        url.pathname = "/rankings/1v1"
        return NextResponse.redirect(url)
    }
    return NextResponse.next()
}

export default handler
