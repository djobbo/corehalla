/**
 * The Worker bindings module.
 *
 * It only exists inside workerd; `@crh/core/env` imports it dynamically and
 * falls back to `process.env` on Node. Declaring the module keeps TypeScript
 * happy without making every Node build depend on `@cloudflare/workers-types`.
 *
 * Repeated per project rather than inherited from `@crh/core`: ambient module
 * declarations are only visible to the program that includes them, and this
 * package is consumed as source.
 */
declare module "cloudflare:workers" {
    export const env: Record<string, unknown>
}
