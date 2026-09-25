import {
    deriveSearchContext,
    markSearchEntry,
    requestSearchFocus,
    searchHref,
} from "@/lib/search"
import type { SearchContext } from "@/lib/search"
import { useNavigate, useRouterState } from "@tanstack/react-router"
import { useCallback, useState } from "react"
import { withViewTransition } from "@/lib/viewTransition"

/**
 * Entering search mode.
 *
 * Search and rankings are one surface, so "searching" means navigating to the
 * rankings route that matches the page you are on. Clicking the bar enters
 * immediately with an empty query; typing can also hand a first character over.
 * The navigation is pushed (not replaced) so Esc can come back here.
 */
export const useSearchHandoff = () => {
    const navigate = useNavigate()
    const pathname = useRouterState({
        select: (state) => state.location.pathname,
    })
    const [value, setValue] = useState("")

    const enterSearch = useCallback(
        (query = "", override?: SearchContext) => {
            const context = override ?? deriveSearchContext(pathname)
            const trimmed = query.trim()

            markSearchEntry(window.location.pathname + window.location.search)
            requestSearchFocus()
            setValue("")

            withViewTransition(() =>
                navigate({ to: searchHref({ ...context, q: trimmed }) as never }),
            )
        },
        [navigate, pathname],
    )

    return { value, setValue, enterSearch }
}
