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
import type { FavoriteInput } from "@/effect/Auth"
import type { JsonValue } from "db/schema"

/**
 * Reads and writes the signed-in user's favourites.
 *
 * Replaces the browser-side `supabase.from("UserFavorite")` calls (and their
 * realtime subscription): the row is scoped to the session's `userId` on the
 * server, so RLS is not needed.
 */

const parseFavorite = (body: unknown): FavoriteInput | null => {
    if (typeof body !== "object" || body === null) return null

    const { id, type, name, meta } = body as Record<string, unknown>

    if (
        typeof id !== "string" ||
        typeof type !== "string" ||
        typeof name !== "string"
    ) {
        return null
    }

    return { id, type, name, meta: (meta ?? null) as JsonValue }
}

const parseFavoriteKey = (
    body: unknown,
): { id: string; type: string } | null => {
    if (typeof body !== "object" || body === null) return null

    const { id, type } = body as Record<string, unknown>

    if (typeof id !== "string" || typeof type !== "string") return null

    return { id, type }
}

export const Route = createFileRoute("/api/me/favorites")({
    server: {
        handlers: {
            async GET({ request }) {
                const favorites = await runAuthed(request, (session) =>
                    Effect.gen(function* () {
                        const auth = yield* Auth

                        return yield* auth.listFavorites(session.user.id)
                    }),
                )

                if (favorites === null) return unauthorized()

                return privateJson(favorites)
            },

            async POST({ request }) {
                if (!isSameOrigin(request)) return forbidden()

                const favorite = parseFavorite(
                    await request.json().catch(() => null),
                )

                if (!favorite) {
                    return new Response("Bad Request", { status: 400 })
                }

                const row = await runAuthed(request, (session) =>
                    Effect.gen(function* () {
                        const auth = yield* Auth

                        return yield* auth.upsertFavorite(
                            session.user.id,
                            favorite,
                        )
                    }),
                )

                if (row === null) return unauthorized()

                return privateJson(row)
            },

            async DELETE({ request }) {
                if (!isSameOrigin(request)) return forbidden()

                const key = parseFavoriteKey(
                    await request.json().catch(() => null),
                )

                if (!key) {
                    return new Response("Bad Request", { status: 400 })
                }

                const done = await runAuthed(request, (session) =>
                    Effect.gen(function* () {
                        const auth = yield* Auth

                        yield* auth.deleteFavorite(session.user.id, key)

                        return true
                    }),
                )

                if (done === null) return unauthorized()

                return new Response(null, { status: 204 })
            },
        },
    },
})
