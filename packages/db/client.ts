import { makeWithDefaults } from "drizzle-orm/effect-d1"
import * as D1Client from "@effect/sql-d1/D1Client"
import { Context, Layer } from "effect"
import type { EffectSQLiteD1Database } from "drizzle-orm/effect-d1"

/**
 * D1 access for the Cloudflare Worker.
 *
 * Every query goes through Effect's D1 client (`@effect/sql-d1`) and Drizzle's
 * Effect integration (`drizzle-orm/effect-d1`), driven by the `DB` binding.
 * The `worker` crawler cannot use a binding, so it uses `db/node.ts` instead —
 * same schema, D1 over HTTP.
 */

/** The D1 database handle, as provided by the `DB` binding. */
export type D1Database = D1Client.D1ClientConfig["db"]

/** The Drizzle database every Worker-side consumer shares. */
export type SqlDatabase = EffectSQLiteD1Database & {
    readonly $client: D1Client.D1Client
}

/**
 * The running Drizzle database.
 *
 * A `Context.Tag` so the Worker can provide the binding with its own lifetime
 * (one per request handler) and `web` can compose it into its services.
 */
export class Database extends Context.Service<Database, SqlDatabase>()(
    "db/Database",
) {}

/** A Drizzle database backed by one D1 binding. */
export const layer = (db: D1Database) =>
    Layer.effect(Database, makeWithDefaults({})).pipe(
        Layer.provide(D1Client.layer({ db })),
    )
