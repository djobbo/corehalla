/**
 * The Worker bindings module.
 *
 * It only exists inside workerd; `src/env.ts` imports it dynamically and falls
 * back to an empty object on Node. Declaring the module keeps TypeScript happy
 * without making every Node build depend on `@cloudflare/workers-types`.
 *
 * Repeated per project rather than shared: ambient module declarations are
 * visible only to the program that includes them.
 */
declare module "cloudflare:workers" {
    export const env: Record<string, unknown>
}
