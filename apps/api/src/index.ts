import { apiHandler } from "./server"

/**
 * Cloudflare Worker entry for the Corehalla API.
 *
 * The handler is the same Effect `HttpApi` the Start app used to mount
 * in-process; only the transport changed. `HttpRouter.toWebHandler` returns a
 * WHATWG `fetch` handler, which is exactly what a Workers module needs, so no
 * platform-specific server layer is required.
 *
 * Bindings (`DB`, `BRAWLHALLA_API_KEY`, …) are read lazily inside the handler
 * through `./env`, because they are not available at module scope.
 */
export default {
    fetch: (request: Request) => apiHandler(request),
}
