import { searchPlayerAlias } from "@/server/api.functions"
import { useQuery } from "@tanstack/react-query"

/**
 * Client-side player search used by the command palette.
 *
 * The Next.js version called a tRPC query. It now calls the typed server
 * function directly; TanStack Query keeps the request debounced/cached and the
 * server function keeps validation + database access on the server.
 */
export const usePlayerSearch = (search: string) => {
    const { data: aliases, isLoading } = useQuery({
        queryKey: ["playerSearch", search],
        queryFn: () =>
            searchPlayerAlias({ data: { alias: search, page: "1" } }),
        enabled: search.length > 0,
    })

    return {
        rankings1v1: [],
        isLoading,
        aliases: aliases ?? [],
    }
}
