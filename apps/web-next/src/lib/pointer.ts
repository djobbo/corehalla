import { useEffect, useState } from "react"

/**
 * Whether the current device has a real pointing device.
 *
 * Returns `false` before mount, which is the safe direction to be wrong in: a
 * coarse pointer fires synthetic `mouseenter` on tap, so without this gate a
 * phone would open a hover preview it can never dismiss. Being briefly `false` on
 * desktop only means a preview cannot appear before hydration, which it could not
 * do usefully anyway.
 */
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
