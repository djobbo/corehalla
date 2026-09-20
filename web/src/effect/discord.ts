import { Effect } from "effect"
import { siteUrl } from "./config"
import { AuthError } from "./errors"

/**
 * Discord OAuth2 + REST calls used by the app-owned sign-in flow.
 *
 * These replace what Supabase Auth's Discord provider did: build the
 * authorize URL, exchange the code, refresh expired tokens, and read the
 * profile/connections with the user's own access token. Everything is
 * server-side; the browser only ever sees the app's own session cookie.
 *
 * Discord's OAuth2 flow does not support PKCE, so the CSRF protection is the
 * single-use `state` value plus the confidential client secret.
 */

const DISCORD_API = "https://discord.com/api"

/** Scopes the app signs in with (`offline.access` yields a refresh token). */
export const DISCORD_SCOPES = [
    "identify",
    "email",
    "connections",
    "guilds",
    "offline.access",
] as const

export type DiscordToken = {
    readonly access_token: string
    readonly refresh_token?: string
    readonly expires_in: number
    readonly scope: string
    readonly token_type: string
}

export type DiscordProfile = {
    readonly id: string
    readonly username: string
    readonly global_name?: string | null
    readonly avatar?: string | null
    readonly email?: string | null
}

export type DiscordConnection = {
    readonly id: string
    readonly name: string
    readonly type: string
    readonly verified: boolean
}

export const discordAuthorizeUrl = (input: {
    clientId: string
    redirectUri: string
    state: string
}) => {
    const params = new URLSearchParams({
        client_id: input.clientId,
        redirect_uri: input.redirectUri,
        response_type: "code",
        scope: DISCORD_SCOPES.join(" "),
        state: input.state,
        // `consent` is what makes Discord return a refresh token.
        prompt: "consent",
    })

    return `https://discord.com/oauth2/authorize?${params.toString()}`
}

/**
 * The OAuth redirect URI.
 *
 * `SITE_URL` is authoritative when configured (production); otherwise the
 * request's own origin is used, which is what local development and preview
 * deployments need.
 */
export const discordRedirectUri = async (request: Request) => {
    const configured = await siteUrl()

    if (configured) {
        return new URL("/api/auth/discord/callback", configured).toString()
    }

    return `${new URL(request.url).origin}/api/auth/discord/callback`
}

export const discordAvatarUrl = (profile: {
    id: string
    avatar?: string | null
}) =>
    profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=128`
        : ""

const wrap = <A>(try_: () => Promise<A>): Effect.Effect<A, AuthError> =>
    Effect.tryPromise({ try: try_, catch: (cause) => new AuthError({ cause }) })

const postToken = async (body: Record<string, string>) => {
    const response = await fetch(`${DISCORD_API}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(body).toString(),
    })

    if (!response.ok) {
        throw new Error(
            `Discord token request failed (${response.status}): ${await response.text()}`,
        )
    }

    return (await response.json()) as DiscordToken
}

export const exchangeDiscordCode = (input: {
    code: string
    clientId: string
    clientSecret: string
    redirectUri: string
}) =>
    wrap(() =>
        postToken({
            client_id: input.clientId,
            client_secret: input.clientSecret,
            grant_type: "authorization_code",
            code: input.code,
            redirect_uri: input.redirectUri,
        }),
    )

export const refreshDiscordToken = (input: {
    refreshToken: string
    clientId: string
    clientSecret: string
}) =>
    wrap(() =>
        postToken({
            client_id: input.clientId,
            client_secret: input.clientSecret,
            grant_type: "refresh_token",
            refresh_token: input.refreshToken,
        }),
    )

const getDiscord = async <A>(token: string, path: `/${string}`) => {
    const response = await fetch(`${DISCORD_API}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
        throw new Error(`Discord request ${path} failed (${response.status})`)
    }

    return (await response.json()) as A
}

export const fetchDiscordProfile = (accessToken: string) =>
    wrap(() => getDiscord<DiscordProfile>(accessToken, "/users/@me"))

export const fetchDiscordConnections = (accessToken: string) =>
    wrap(() =>
        getDiscord<readonly DiscordConnection[]>(
            accessToken,
            "/users/@me/connections",
        ),
    )
