import { Effect } from "effect"
import { envValue } from "@crh/core/env"

/** Read per request: Worker bindings are not available at module scope. */

const read = (key: string) => Effect.promise(() => envValue(key))

export const discordConfig = Effect.gen(function* () {
    const clientId = (yield* read("DISCORD_CLIENT_ID")) ?? ""
    const clientSecret = (yield* read("DISCORD_CLIENT_SECRET")) ?? ""

    return { clientId, clientSecret }
})

/** `Secure` follows the request URL. There is no `NODE_ENV` fallback. */
export const isSecureRequest = (url: string) => {
    try {
        return new URL(url).protocol === "https:"
    } catch {
        return false
    }
}

/** Host of the incoming request: the worker is mounted on two hostnames. */
export const discordRedirectUri = (requestUrl: string) =>
    new URL("/api/v1/auth/discord/callback", requestUrl).toString()
