import { Effect, Layer } from "effect"
import { layer as sqlLayer } from "db/client"
import { d1Database } from "@/env"
import { Auth } from "./Auth"
import { layer as authLayer } from "./Auth"
import { makeLayer as databaseLayer } from "./Database"
import type { D1Database } from "db/client"
import type { AuthSession } from "./Auth"
import type { AuthError } from "./errors"
import type { Database } from "./Database"

/**
 * Runs a server-route effect against services scoped to the call.
 *
 * The shared `/api/effect` handler keeps its services alive for the isolate;
 * one-off TanStack Start server routes (auth, `me/*`) build a fresh D1 client
 * and release it when the request finishes. The `DB` binding is resolved per
 * call because it only exists inside the Worker.
 */
const runScoped = <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    layer: Layer.Layer<R, unknown, never>,
): Promise<A> =>
    Effect.runPromise(
        Effect.scoped(
            Effect.gen(function* () {
                const context = yield* Layer.build(layer)
                return yield* effect.pipe(Effect.provide(context))
            }),
        ),
    )

const resolve = (override?: D1Database) => override ?? d1Database()

/** Runs a stats/database effect on a D1 client scoped to the call. */
export const runDatabase = async <A, E>(
    effect: Effect.Effect<A, E, Database>,
    override?: D1Database,
): Promise<A> => runScoped(effect, databaseLayer(await resolve(override)))

/** Runs an auth effect on a D1 client scoped to the call. */
export const runAuth = async <A, E>(
    effect: Effect.Effect<A, E, Auth>,
    override?: D1Database,
): Promise<A> =>
    runScoped(
        effect,
        authLayer.pipe(
            Layer.provide(sqlLayer(await resolve(override))),
        ) as Layer.Layer<Auth, unknown, never>,
    )

/**
 * Resolves the request's session and runs `program` with it.
 *
 * Returns `null` when the caller is anonymous, so routes can answer 401
 * without treating an unauthenticated request as an error.
 */
export const runAuthed = async <A>(
    request: Request,
    program: (session: AuthSession) => Effect.Effect<A, AuthError, Auth>,
    override?: D1Database,
): Promise<A | null> =>
    runAuth(
        Effect.gen(function* () {
            const auth = yield* Auth
            const session = yield* auth.getSession(request.headers)

            if (!session) return null

            return yield* program(session)
        }),
        override,
    )
