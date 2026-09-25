import { isSecureRequest } from "./config"

/**
 * Same-origin guard for state-changing server routes.
 *
 * The session cookie is `SameSite=Lax`, which already blocks cross-site form
 * posts; this is the second line of defence for `fetch`-based mutations. A
 * missing `Origin`/`Referer` (non-browser clients, same-origin `GET`) is
 * allowed.
 */
export const isSameOrigin = (request: Request) => {
    const source =
        request.headers.get("origin") ?? request.headers.get("referer")

    if (!source) return true

    try {
        const sourceHost = new URL(source).host
        const targetHost =
            request.headers.get("host") ?? new URL(request.url).host

        return sourceHost === targetHost
    } catch {
        return false
    }
}

export const forbidden = () => new Response("Forbidden", { status: 403 })

export const unauthorized = () => new Response("Unauthorized", { status: 401 })

export const privateJson = (value: unknown, init?: ResponseInit) =>
    Response.json(value, {
        ...init,
        headers: {
            "Cache-Control": "private, no-store",
            ...init?.headers,
        },
    })

/** Cookie attributes shared by the session and OAuth-state cookies. */
export const cookieSecurity = (request: Request) => ({
    secure: isSecureRequest(request),
})
