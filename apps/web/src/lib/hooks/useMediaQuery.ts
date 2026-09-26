import { useEffect, useState } from "react"

/**
 * SSR-safe `matchMedia` hook.
 *
 * The server (and the first client render, so hydration matches) always reports
 * `false`; the listener updates after mount. This is only used to decide
 * whether to *mount* optional UI, never to style something that is already
 * rendered.
 */
export const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return

        const list = window.matchMedia(query)
        setMatches(list.matches)

        const onChange = (event: MediaQueryListEvent) =>
            setMatches(event.matches)

        list.addEventListener("change", onChange)
        return () => list.removeEventListener("change", onChange)
    }, [query])

    return matches
}
