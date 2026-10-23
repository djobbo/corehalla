import { createFileRoute } from "@tanstack/react-router"
import { Effect } from "effect"
import { Auth } from "@/effect/Auth"
import { discordConfig, isSecureRequest, siteUrl } from "@/effect/config"
import {
    OAUTH_STATE_COOKIE,
    SESSION_COOKIE,
    clearCookie,
    readCookie,
    serializeCookie,
} from "@/effect/cookies"
import {
    discordAvatarUrl,
    discordRedirectUri,
    exchangeDiscordCode,
    fetchDiscordProfile,
} from "@/effect/discord"
import { runAuth } from "@/effect/run"

/**
 * Discord OAuth callback.
 *
 * Exchanges the code, upserts the profile and mints the app session cookie.
 * The Supabase equivalent returned a session object to the browser; here the
 * Discord tokens never leave the server.
 */
export const Route = createFileRoute("/api/auth/discord/callback")({
    server: {
        handlers: {
            async GET({ request }) {
                const url = new URL(request.url)
                const code = url.searchParams.get("code")
                const state = url.searchParams.get("state")
                const oauthError = url.searchParams.get("error")
                const { clientId, clientSecret } = await discordConfig()
                const secure = isSecureRequest(request)
                const configuredSiteUrl = await siteUrl()
                const cookieState = readCookie(
                    request.headers.get("cookie"),
                    OAUTH_STATE_COOKIE,
                )

                const appUrl = (path: string) =>
                    configuredSiteUrl
                        ? new URL(path, configuredSiteUrl).toString()
                        : new URL(path, request.url).toString()

                const redirect = (location: string, cookies: string[]) => {
                    const headers = new Headers()

                    headers.set("Location", location)
                    headers.set("Cache-Control", "no-store")

                    for (const cookie of cookies) {
                        headers.append("Set-Cookie", cookie)
                    }

                    return new Response(null, { status: 303, headers })
                }

                const fail = () =>
                    redirect(appUrl("/?auth=error"), [
                        clearCookie(OAUTH_STATE_COOKIE, { secure }),
                    ])

                if (
                    oauthError ||
                    !code ||
                    !state ||
                    !cookieState ||
                    cookieState !== state
                ) {
                    return fail()
                }

                try {
                    const redirectUri = await discordRedirectUri(request)

                    const session = await runAuth(
                        Effect.gen(function* () {
                            const auth = yield* Auth

                            const token = yield* exchangeDiscordCode({
                                code,
                                clientId,
                                clientSecret,
                                redirectUri,
                            })

                            const profile = yield* fetchDiscordProfile(
                                token.access_token,
                            )

                            const user = yield* auth.upsertDiscordUser({
                                discordId: profile.id,
                                username: profile.username,
                                avatarUrl: discordAvatarUrl(profile),
                                email: profile.email ?? null,
                            })

                            return yield* auth.createSession({
                                userId: user.id,
                                accessToken: token.access_token,
                                refreshToken: token.refresh_token ?? null,
                                expiresIn: token.expires_in,
                                scope: token.scope,
                            })
                        }),
                    )

                    const maxAge = Math.floor(
                        (session.expiresAt.getTime() - Date.now()) / 1000,
                    )

                    return redirect(appUrl("/?auth=ok"), [
                        serializeCookie(SESSION_COOKIE, session.token, {
                            maxAge,
                            secure,
                            sameSite: "lax",
                        }),
                        clearCookie(OAUTH_STATE_COOKIE, { secure }),
                    ])
                } catch {
                    return fail()
                }
            },
        },
    },
})
