import { createCsrfMiddleware, createStart } from "@tanstack/react-start"

/**
 * Server functions are same-origin RPC endpoints. Registering the CSRF
 * middleware explicitly (rather than relying on the implicit default) makes the
 * trust boundary visible: requests to a server function must carry an
 * `Origin`/`Referer`/`Sec-Fetch-Site` header matching this deployment.
 */
export const startInstance = createStart(() => ({
    requestMiddleware: [
        createCsrfMiddleware({
            filter: (ctx) => ctx.handlerType === "serverFn",
        }),
    ],
}))
