import { createFileRoute } from "@tanstack/react-router"
import { Effect } from "effect"
import { Auth } from "@/effect/Auth"
import {
    forbidden,
    isSameOrigin,
    privateJson,
    unauthorized,
} from "@/effect/http"
import { runAuthed } from "@/effect/run"

/**
 * The signed-in user's Discord connections.
 *
 * `GET` reads what is stored; `POST` re-fetches from Discord with the session's
 * access token and upserts. Replaces the browser-side upsert + realtime
 * subscription in `useUserConnections`.
 */
export const Route = createFileRoute("/api/me/connections")({
    server: {
        handlers: {
            async GET({ request }) {
                const connections = await runAuthed(request, (session) =>
                    Effect.gen(function* () {
                        const auth = yield* Auth

                        return yield* auth.listConnections(session.user.id)
                    }),
                )

                if (connections === null) return unauthorized()

                return privateJson(connections)
            },

            async POST({ request }) {
                if (!isSameOrigin(request)) return forbidden()

                const connections = await runAuthed(request, (session) =>
                    Effect.gen(function* () {
                        const auth = yield* Auth

                        return yield* auth.syncConnections(session)
                    }),
                )

                if (connections === null) return unauthorized()

                return privateJson(connections)
            },
        },
    },
})
