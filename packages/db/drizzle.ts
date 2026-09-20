/**
 * Single import surface for the Node-side consumers of the database package.
 *
 * `packages/server` and `worker` previously reached for `db/supabase/service`
 * and never depended on Drizzle or Effect themselves. Re-exporting the query
 * builder, the schema and the connection here keeps their dependency lists
 * unchanged while giving them the real Drizzle client.
 *
 * `web` imports `drizzle-orm`, `db/schema` and `db/client` directly.
 */
export * from "drizzle-orm"
export * as Effect from "effect/Effect"
export * from "./schema"
export * from "./client"
