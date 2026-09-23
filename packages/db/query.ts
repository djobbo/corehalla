/**
 * Drizzle query surface for consumers outside `packages/db`.
 *
 * `drizzle-orm` is peer-sensitive: if a consumer installs its own copy, the
 * schema's column types and that copy's query operators are structurally
 * incompatible (they come from two different `SQL` classes). Keeping the single
 * installation in this package and re-exporting it here means `web` and
 * `worker` always share `db`'s instance.
 */
export * from "drizzle-orm"
export * from "./schema"
