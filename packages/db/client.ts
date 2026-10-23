import { makeWithDefaults } from "drizzle-orm/effect-d1"
import * as D1Client from "@effect/sql-d1/D1Client"
import { Context, Layer } from "effect"
import type { EffectSQLiteD1Database } from "drizzle-orm/effect-d1"

export type D1Database = D1Client.D1ClientConfig["db"]

export type SqlDatabase = EffectSQLiteD1Database & {
    readonly $client: D1Client.D1Client
}

export class Database extends Context.Service<Database, SqlDatabase>()(
    "db/Database",
) {}

export const layer = (db: D1Database) =>
    Layer.effect(Database, makeWithDefaults({})).pipe(
        Layer.provide(D1Client.layer({ db })),
    )
