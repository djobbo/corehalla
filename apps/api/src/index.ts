import { apiHandler } from "./server"

/**
 * Cloudflare Worker entry for the Corehalla API.
 *
 * Serves the Effect `HttpApi` at `/api/v1/*`. `HttpRouter.toWebHandler` returns
 * a WHATWG `fetch` handler, which is exactly what a Workers module needs, so no
 * platform-specific server layer is required.
 *
 * This worker used to carry the crawler too. That moved to `@crh/crawler` so the
 * two stop contending for one upstream allowance: the crawler cannot spend the
 * share reserved for user requests, and a slow crawl cannot affect request
 * latency. The split is about our own accounting — the v1 limit is per IP and
 * Workers egress from shared Cloudflare addresses, so it does not create a
 * second allowance upstream.
 *
 * Bindings are read lazily inside the handler through `@crh/core/env`, because
 * they do not exist at module scope.
 */
export default {
    fetch: (request: Request) => apiHandler(request),
}
