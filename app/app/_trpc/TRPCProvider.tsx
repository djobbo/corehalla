"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode, useState } from "react"
import { httpBatchLink } from "@trpc/client"
import { trpc } from "./client"
import SuperJSON from "superjson"

type TRPCProviderProps = {
    children: ReactNode
}

export const TRPCProvider = ({ children }: TRPCProviderProps) => {
    const [queryClient] = useState(() => new QueryClient())
    const [trpcClient] = useState(() => {
        return trpc.createClient({
            transformer: SuperJSON,
            links: [
                httpBatchLink({
                    url: `${
                        process.env.NEXT_PUBLIC_API_URL ||
                        "http://localhost:3000"
                    }/api/trpc`,
                }),
            ],
        })
    })

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    )
}
