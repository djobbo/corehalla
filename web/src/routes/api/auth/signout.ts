import { createFileRoute } from "@tanstack/react-router"
import { Effect } from "effect"
import { Auth } from "@/effect/Auth"
import { SESSION_COOKIE, clearCookie } from "@/effect/cookies"
import { cookieSecurity, forbidden, isSameOrigin } from "@/effect/http"
import { runAuth } from "@/effect/run"

/** Signs the caller out and clears the session cookie. */
export const Route = createFileRoute("/api/auth/signout")({
    server: {
        handlers: {
            async POST({ request }) {
                if (!isSameOrigin(request)) return forbidden()

                try {
                    await runAuth(
                        Effect.gen(function* () {
                            const auth = yield* Auth

                            yield* auth.deleteSession(request.headers)
                        }),
                    )
                } catch {
                    // Clearing the cookie is what the caller observes; a
                    // database hiccup must not keep them "signed in".
                }

                return new Response(null, {
                    status: 204,
                    headers: {
                        "Set-Cookie": clearCookie(
                            SESSION_COOKIE,
                            cookieSecurity(request),
                        ),
                        "Cache-Control": "private, no-store",
                    },
                })
            },
        },
    },
})
