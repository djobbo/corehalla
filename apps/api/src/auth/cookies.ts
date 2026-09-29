/** Cookie names shared with the handlers. The raw token is never stored. */

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

/** Session row key. The database stores the digest, not the cookie value. */
export const sha256Hex = async (value: string) => {
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value))

    return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")
}
