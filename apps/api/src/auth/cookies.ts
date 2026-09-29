/**
 * The two cookies the app owns, and the token primitives behind them.
 *
 * Reading is deliberately absent: the API's `HttpServerRequest` already exposes
 * parsed cookies, and writing goes through `HttpServerResponse`'s own cookie
 * encoder. What is left is the pair of names the two sides must agree on, and
 * the opaque-token helpers — which is all the API needs, because it is the side
 * that mints and digests the token rather than the side that serialises it.
 */

export const SESSION_COOKIE = "corehalla_session"
export const OAUTH_STATE_COOKIE = "corehalla_oauth_state"

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

/**
 * Hex-encoded SHA-256 digest, used as the session storage key.
 *
 * The browser holds the token; the database holds only this, so a database leak
 * cannot be replayed as a login.
 */
export const sha256Hex = async (value: string) => {
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value))

    return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")
}
