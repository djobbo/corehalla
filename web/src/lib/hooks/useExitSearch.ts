import { consumeSearchEntry } from "@/lib/search"
import { useNavigate } from "@tanstack/react-router"
import { useCallback } from "react"
import { withViewTransition } from "@/lib/viewTransition"

/**
 * Leaves search mode.
 *
 * Navigates back to the page the search was entered from — through the router
 * so the bar morphs home — and returns false when the user arrived on a search
 * URL directly (nothing to go back to).
 */
export const useExitSearch = (): (() => boolean) => {
    const navigate = useNavigate()

    return useCallback(() => {
        const entry = consumeSearchEntry()
        if (!entry) return false

        withViewTransition(() =>
            navigate({ to: entry as never, replace: true }),
        )

        return true
    }, [navigate])
}
