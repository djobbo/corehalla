import { useEffect, useState } from "react"

/**
 * Tracks a media query.
 *
 * Returns `false` on the server and on the first client render, then the real
 * value once mounted. That ordering is deliberate rather than incidental: the
 * server cannot know the pointer type, so anything gated on this must render its
 * "no" branch first and upgrade afterwards. For an overlay that is the safe
 * direction — the fallback is a plain navigation, which always works.
 */
export const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const list = window.matchMedia(query)

        setMatches(list.matches)

        const onChange = (event: MediaQueryListEvent) =>
            setMatches(event.matches)

        list.addEventListener("change", onChange)

        return () => list.removeEventListener("change", onChange)
    }, [query])

    return matches
}
