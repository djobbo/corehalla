import { useMemo, useState } from "react"

export const useSortByProp = <T, U extends keyof T>(
    array: T[],
    compareFns: Record<U, (a: T, b: T) => number>,
    defaultProp: U,
) => {
    const [sortBy, setSortBy] = useState(defaultProp)

    const sortedArray = useMemo(
        () => array.sort(compareFns[sortBy]),
        [sortBy, array, compareFns],
    )

    return [sortedArray, setSortBy]
}
