/**
 * Single import surface for the Node-side consumers of the database package.
 *
 * `worker` previously reached for `db/supabase/service` and never depended on
 * Drizzle or Effect itself. Re-exporting the query builder, the schema and the
 * connection here keeps its dependency list unchanged while giving it the real
 * Drizzle client.
 *
 * `web` imports `drizzle-orm`, `db/schema` and `db/client` directly.
 */
export * from "drizzle-orm"
export * as Effect from "effect/Effect"
export * from "./schema"
export * from "./client"
