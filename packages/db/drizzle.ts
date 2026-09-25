/**
 * Single import surface for the Node-side consumer of the database package
 * (the `worker` crawler).
 *
 * Re-exporting the query builder, the schema and the D1-over-HTTP connection
 * keeps the crawler's dependency list unchanged while giving it the real
 * Drizzle client. `web` imports `drizzle-orm`, `db/schema` and `db/client`
 * (the Worker binding) directly.
 */
export * from "drizzle-orm"
export * as Effect from "effect/Effect"
export * from "./schema"
export * from "./node"
