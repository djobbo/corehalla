import { type NextRequest } from "next/server"
import { i18nConfig } from "@/i18n/i18nConfig"
import { i18nRouter } from "next-i18n-router"

export function middleware(request: NextRequest) {
    return i18nRouter(request, i18nConfig)
}

export const config = {
    matcher: "/((?!api|static|.*\\..*|_next).*)",
}
