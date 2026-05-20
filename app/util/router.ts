import {
    useNavigate,
    useParams,
    useRouterState,
    useSearch,
} from "@tanstack/react-router"

/** TanStack Router helpers for layout components that need pathname and query. */
export function useAppRouter() {
    const navigate = useNavigate()
    const pathname = useRouterState({ select: (s) => s.location.pathname })
    const params = useParams({ strict: false }) as Record<
        string,
        string | undefined
    >
    const search = useSearch({ strict: false }) as Record<
        string,
        string | undefined
    >

    return {
        pathname,
        query: { ...params, ...search },
        push: (url: string) => {
            void navigate({ href: url })
        },
    }
}
