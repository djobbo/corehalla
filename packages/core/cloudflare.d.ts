/** Declared so Node builds need not depend on `@cloudflare/workers-types`. */
declare module "cloudflare:workers" {
    export const env: Record<string, unknown>
}
