import { useState } from "react"
import type { ReactNode } from "react"

/**
 * Client-side sorting for the player page's lists.
 *
 * The legacy app grew a comparable hook around `useMemo`; this one sorts on
 * every render instead. That is deliberate: the lists are at most a few dozen
 * rows, the comparator is a numeric subtraction, and a memo keyed on an options
 * object literal — which callers rebuild every render anyway — is a dependency
 * trap for no measurable gain.
 */
export type SortDirection = "asc" | "desc"

export type SortOption<T> = {
    readonly label: string
    readonly compare: (a: T, b: T) => number
    /** Shown at the end of the row, so the sorted figure is the visible one. */
    readonly display?: (item: T) => ReactNode
}

export type SortChoice<K extends string> = {
    readonly value: K
    readonly label: string
}

export const useSortBy = <T, K extends string>(
    items: readonly T[],
    options: Record<K, SortOption<T>>,
    initialKey: K,
    initialDirection: SortDirection = "desc",
) => {
    const [key, setKey] = useState<K>(initialKey)
    const [direction, setDirection] = useState<SortDirection>(initialDirection)

    const factor = direction === "asc" ? 1 : -1
    const sorted = [...items].sort(
        (a, b) => options[key].compare(a, b) * factor,
    )

    const choices = (Object.keys(options) as K[]).map((value) => ({
        value,
        label: options[value].label,
    }))

    return {
        sorted,
        key,
        setKey,
        direction,
        toggleDirection: () =>
            setDirection((current) => (current === "asc" ? "desc" : "asc")),
        choices,
        display: options[key].display,
    }
}
