/**
 * Minimal cookie and token primitives for the app-owned auth flow.
 *
 * The session lives in an opaque random token; only its SHA-256 digest is
 * stored, so a database leak cannot be replayed as a login. Web Crypto is
 * available on both Node and Cloudflare Workers, so no platform layer is
 * needed.
 */

export const SESSION_COOKIE = "corehalla_session"
export const OAUTH_STATE_COOKIE = "corehalla_oauth_state"

export type CookieOptions = {
    readonly maxAge?: number
    readonly httpOnly?: boolean
    readonly secure?: boolean
    readonly sameSite?: "lax" | "strict" | "none"
    readonly path?: string
}

export const parseCookies = (header: string | null): Record<string, string> => {
    if (!header) return {}

    const cookies: Record<string, string> = {}

    for (const part of header.split(";")) {
        const index = part.indexOf("=")

        if (index === -1) continue

        const name = part.slice(0, index).trim()
        const value = part.slice(index + 1).trim()

        if (name.length === 0) continue

        try {
            cookies[name] = decodeURIComponent(value)
        } catch {
            cookies[name] = value
        }
    }

    return cookies
}

export const readCookie = (header: string | null, name: string) =>
    parseCookies(header)[name]

export const serializeCookie = (
    name: string,
    value: string,
    options: CookieOptions = {},
) => {
    const parts = [`${name}=${encodeURIComponent(value)}`]

    parts.push(`Path=${options.path ?? "/"}`)

    if (options.maxAge !== undefined) {
        parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`)
    }

    if (options.httpOnly ?? true) parts.push("HttpOnly")
    if (options.secure) parts.push("Secure")

    parts.push(
        `SameSite=${
            options.sameSite === "strict"
                ? "Strict"
                : options.sameSite === "none"
                  ? "None"
                  : "Lax"
        }`,
    )

    return parts.join("; ")
}

export const clearCookie = (name: string, options: CookieOptions = {}) =>
    serializeCookie(name, "", { ...options, maxAge: 0 })

const encoder = new TextEncoder()

const toBase64Url = (bytes: Uint8Array) => {
    let binary = ""

    for (const byte of bytes) binary += String.fromCharCode(byte)

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "")
}

/** A cryptographically random, URL-safe opaque token. */
export const randomToken = (size = 32) =>
    toBase64Url(crypto.getRandomValues(new Uint8Array(size)))

/** Hex-encoded SHA-256 digest, used as the session storage key. */
export const sha256Hex = async (value: string) => {
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value))

    return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")
}
