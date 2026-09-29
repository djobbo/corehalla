/**
 * The Worker bindings module.
 *
 * It only exists inside workerd; `web/src/env.ts` imports it dynamically and
 * falls back to `process.env` on Node. Declaring the module keeps TypeScript
 * happy without making every Node build depend on `@cloudflare/workers-types`.
 */
declare module "cloudflare:workers" {
    export const env: Record<string, unknown>
}
