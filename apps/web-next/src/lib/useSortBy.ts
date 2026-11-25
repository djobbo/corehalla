import { useState } from "react"
import type { ReactNode } from "react"

export type SortDirection = "asc" | "desc"

export type SortOption<T> = {
    readonly label: string
    readonly compare: (a: T, b: T) => number
    /** Items the metric has no value for sort behind every item that has one. */
    readonly isMissing?: (item: T) => boolean
    readonly display?: (item: T) => ReactNode
}

export type SortChoice<K extends string> = {
    readonly value: K
    readonly label: string
}

export const compareBy =
    <T>(option: SortOption<T>, direction: SortDirection) =>
    (left: T, right: T): number => {
        if (option.isMissing !== undefined) {
            const leftMissing = option.isMissing(left)
            const rightMissing = option.isMissing(right)

            if (leftMissing !== rightMissing) return leftMissing ? 1 : -1
            if (leftMissing) return 0
        }

        const factor = direction === "asc" ? 1 : -1

        return option.compare(left, right) * factor
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

    const sorted = [...items].sort(compareBy(options[key], direction))

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
