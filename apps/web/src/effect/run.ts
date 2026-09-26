import { Effect, Layer } from "effect"
import { layer as sqlLayer } from "@crh/db/client"
import { d1Database } from "@/env"
import { Auth } from "./Auth"
import { layer as authLayer } from "./Auth"
import type { D1Database } from "@crh/db/client"
import type { AuthSession } from "./Auth"
import type { AuthError } from "./errors"

/**
 * Runs a server-route effect against services scoped to the call.
 *
 * The ranking/alias data now lives behind the API worker, so the Start app only
 * runs *auth* effects locally: session, favorites and connections are read with
 * the request's own cookies, which have no business crossing a service binding.
 * Each call builds a fresh D1 client and releases it when the request finishes;
 * the `DB` binding is resolved per call because it only exists inside the Worker.
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
