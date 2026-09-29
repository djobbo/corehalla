import { createFileRoute } from "@tanstack/react-router"
import { discordConfig, isSecureRequest } from "@/effect/config"
import {
    OAUTH_STATE_COOKIE,
    randomToken,
    serializeCookie,
} from "@/effect/cookies"
import { discordAuthorizeUrl, discordRedirectUri } from "@/effect/discord"

/**
 * Starts the Discord sign-in.
 *
 * Replaces `supabase.auth.signInWithOAuth({ provider: "discord" })`: the state
 * value is minted here, stored in a short-lived HttpOnly cookie, and checked
 * again in the callback.
 */
export const Route = createFileRoute("/api/auth/discord")({
    server: {
        handlers: {
            async GET({ request }) {
                const { clientId } = await discordConfig()

                if (!clientId) {
                    return Response.json(
                        { error: "Discord sign-in is not configured" },
                        { status: 500 },
                    )
                }

                const state = randomToken(16)
                const secure = isSecureRequest(request)

                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: discordAuthorizeUrl({
                            clientId,
                            redirectUri: await discordRedirectUri(request),
                            state,
                        }),
                        "Set-Cookie": serializeCookie(
                            OAUTH_STATE_COOKIE,
                            state,
                            { maxAge: 600, secure, sameSite: "lax" },
                        ),
                        "Cache-Control": "no-store",
                    },
                })
            },
        },
    },
})
