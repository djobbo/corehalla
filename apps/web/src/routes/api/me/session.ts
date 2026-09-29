import { createFileRoute } from "@tanstack/react-router"
import { Effect } from "effect"
import { Auth } from "@/effect/Auth"
import { privateJson } from "@/effect/http"
import { runAuth } from "@/effect/run"

/**
 * The signed-in user's profile, or `{ user: null }` for an anonymous caller.
 *
 * Replaces `supabase.auth.getSession()`; the Discord tokens stay server-side.
 */
export const Route = createFileRoute("/api/me/session")({
    server: {
        handlers: {
            async GET({ request }) {
                const session = await runAuth(
                    Effect.gen(function* () {
                        const auth = yield* Auth

                        return yield* auth.getSession(request.headers)
                    }),
                )

                return privateJson({ user: session?.user ?? null })
            },
        },
    },
})
