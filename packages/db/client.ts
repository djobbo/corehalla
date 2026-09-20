import { makeWithDefaults } from "drizzle-orm/effect-postgres"
import * as PgClient from "@effect/sql-pg/PgClient"
import { Context, Layer, ManagedRuntime, Redacted } from "effect"
import type { Effect } from "effect"
import type { EffectPgDatabase } from "drizzle-orm/effect-postgres"

/**
 * Direct PostgreSQL access for the whole workspace.
 *
 * Supabase is only a Postgres host: every query goes through the Effect
 * PostgreSQL client (`@effect/sql-pg`) and Drizzle's Effect integration
 * (`drizzle-orm/effect-postgres`), with no PostgREST/GoTrue/Realtime client in
 * the loop. `DATABASE_URL` is the single connection setting.
 *
 * The `SqlDatabase` service carries the Drizzle database; `runDatabase` runs an
 * effect on a process-wide pool for the Node entry points (the tRPC router and
 * the crawler), while the `web` package composes `layer(url)` into its own
 * per-request services.
 */

/** The Drizzle database every consumer shares. */
export type SqlDatabase = EffectPgDatabase & {
    readonly $client: PgClient.PgClient
}

/**
 * The running Drizzle database.
 *
 * A `Context.Tag` rather than a bare value so packages can provide a pool with
 * their own lifetime (`web` builds one per server request).
 */
export class Database extends Context.Service<Database, SqlDatabase>()(
    "db/Database",
) {}

/** A connection pool + Drizzle database for one connection URL. */
export const layer = (url: string) =>
    Layer.effect(Database, makeWithDefaults({})).pipe(
        Layer.provide(PgClient.layer({ url: Redacted.make(url) })),
    )

/**
 * Options shared by the database-writing helpers.
 *
 * Kept so the mutation signatures did not have to change when the Supabase
 * client was removed; the Effect SQL driver has no `AbortSignal` knob.
 */
export type DatabaseOptions = {
    readonly abortSignal?: AbortSignal
}

const databaseUrl = () => process.env.DATABASE_URL ?? ""

let runtime: ManagedRuntime.ManagedRuntime<Database, unknown> | undefined

/**
 * Runs one database effect on a lazily-created process-wide pool.
 *
 * Long-lived Node processes (the tRPC router behind the legacy Next app and the
 * crawler) call this instead of building a pool per query. Serverless entry
 * points must not use it — they provide `layer(url)` per request.
 */
export const runDatabase = <A, E>(
    effect: Effect.Effect<A, E, Database>,
    url: string = databaseUrl(),
): Promise<A> => {
    if (!runtime) {
        runtime = ManagedRuntime.make(
            layer(url),
        ) as ManagedRuntime.ManagedRuntime<Database, unknown>
    }

    return runtime.runPromise(effect)
}

/** Releases the process-wide pool (tests, graceful shutdown). */
export const disposeDatabase = async () => {
    if (runtime) {
        await runtime.dispose()
        runtime = undefined
    }
}
