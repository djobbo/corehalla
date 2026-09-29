/** Ambient so Node builds type-check without `@cloudflare/workers-types`. */
declare module "cloudflare:workers" {
    export const env: Record<string, unknown>
}
