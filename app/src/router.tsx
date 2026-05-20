import { ErrorPageContent } from "#/components/layout/ErrorPageContent"
import { queryClient, trpc, trpcClient, trpcProxy } from "#/util/trpc"
import { QueryClientProvider } from "@tanstack/react-query"
import { createRouter } from "@tanstack/react-router"

import type { RouterContext } from "./router-context"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
    return createRouter({
        routeTree,
        context: {
            queryClient,
            trpcClient,
            trpcProxy,
        } satisfies RouterContext,
        defaultPreload: "intent",
        scrollRestoration: true,
        defaultNotFoundComponent: () => (
            <ErrorPageContent title="Page not found" statusCode={404} />
        ),
        defaultErrorComponent: () => <ErrorPageContent statusCode={500} />,
        Wrap: ({ children }) => (
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </trpc.Provider>
        ),
    })
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}
