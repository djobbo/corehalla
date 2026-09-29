import { Effect } from "effect"
import { envValue } from "@crh/core/env"

/**
 * Runtime configuration for the app-owned auth flow.
 *
 * Bindings are read per call rather than at module scope, because they do not
 * exist until a request is in flight. The reads are wrapped in `Effect` so the
 * credentials are a value a handler can `yield*` like any other dependency,
 * rather than a `Promise` awaited in the middle of a program.
 */

const read = (key: string) => Effect.promise(() => envValue(key))

export const discordConfig = Effect.gen(function* () {
    const clientId = (yield* read("DISCORD_CLIENT_ID")) ?? ""
    const clientSecret = (yield* read("DISCORD_CLIENT_SECRET")) ?? ""

    return { clientId, clientSecret }
})

/**
 * Whether a cookie should carry `Secure`.
 *
 * Workers always serve HTTPS; local development does not, so the request's own
 * URL decides. There is deliberately no `NODE_ENV` fallback: this code only ever
 * runs inside the Worker, where the URL is the truth.
 */
export const isSecureRequest = (url: string) => {
    try {
        return new URL(url).protocol === "https:"
    } catch {
        return false
    }
}

/**
 * The OAuth redirect URI for the host the request arrived on.
 *
 * Derived from the request rather than from a configured origin, because this
 * worker is routed on two hostnames (`corehalla.com` and `next.corehalla.com`)
 * and the callback has to return to whichever one started the flow. A single
 * configured `SITE_URL` would send half the sign-ins to the other app's domain,
 * where the state cookie does not exist.
 */
export const discordRedirectUri = (requestUrl: string) =>
    new URL("/api/v1/auth/discord/callback", requestUrl).toString()
