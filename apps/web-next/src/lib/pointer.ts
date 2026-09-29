import { useEffect, useState } from "react"

/** False before mount: coarse pointers fire synthetic mouseenter on tap. */
export const useHasPointer = (): boolean => {
    const [hasPointer, setHasPointer] = useState(false)

    useEffect(() => {
        const list = window.matchMedia("(hover: hover) and (pointer: fine)")

        setHasPointer(list.matches)

        const onChange = (event: MediaQueryListEvent) =>
            setHasPointer(event.matches)

        list.addEventListener("change", onChange)

        return () => list.removeEventListener("change", onChange)
    }, [])

    return hasPointer
}
