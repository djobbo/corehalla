import { envValue } from "@/env"

/**
 * Runtime configuration.
 *
 * Values come from `process.env` on Node and from Worker bindings on
 * Cloudflare; `envValue` hides the difference. Everything is async because
 * reading a binding is.
 */

export const env = (key: string) => envValue(key)

export const discordConfig = async () => ({
    clientId: (await envValue("DISCORD_CLIENT_ID")) ?? "",
    clientSecret: (await envValue("DISCORD_CLIENT_SECRET")) ?? "",
})

export const siteUrl = async () => (await envValue("SITE_URL")) ?? ""

export const isProduction = () =>
    (globalThis.process?.env?.NODE_ENV ?? "") === "production"

/**
 * Whether the session cookie should carry `Secure`.
 *
 * Workers always serve HTTPS; Node local development does not, so the request
 * protocol (with `NODE_ENV` as a fallback) decides.
 */
export const isSecureRequest = (request: Request) => {
    try {
        return new URL(request.url).protocol === "https:" || isProduction()
    } catch {
        return isProduction()
    }
}
