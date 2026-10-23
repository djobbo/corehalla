import { useState } from "react"
import type { ReactNode } from "react"

export type SortDirection = "asc" | "desc"

export type SortOption<T> = {
    readonly label: string
    readonly compare: (a: T, b: T) => number
    readonly display?: (item: T) => ReactNode
}

export type SortChoice<K extends string> = {
    readonly value: K
    readonly label: string
}

/** Sorts every render on purpose — lists are small; memoizing options is a trap. */
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
