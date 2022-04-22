import { NextResponse } from "next/server"
import type { NextMiddleware } from "next/server"
const handler: NextMiddleware = (req) => {
    if (!req.page.name) {
        const url = req.nextUrl.clone()
        url.pathname = req.nextUrl.pathname.startsWith("/rankings/2v2")
            ? "/rankings/2v2/all/1"
            : "/rankings/1v1/all/1"
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export default handler
