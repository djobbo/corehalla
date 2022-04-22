import { useMemo, useState } from "react"

type CompareFn<ElementType> = {
    name: string
    fn: (a: ElementType, b: ElementType) => number
}

export enum SortDirection {
    Ascending = 1,
    Descending = -1,
}

export const useSortBy = <ElementType, Option extends string>(
    array: ElementType[],
    compareFns: Record<Option, CompareFn<ElementType>>,
    defaultProp: Option,
    defaultDirection: SortDirection = SortDirection.Ascending,
) => {
    const [sortBy, setSortBy] = useState(defaultProp)
    const [sortDirection, setSortDirection] =
        useState<SortDirection>(defaultDirection) // 1 = ascending, -1 = descending

    const sortedArray = useMemo(
        () =>
            array
                .slice(0)
                .sort((a, b) => compareFns[sortBy].fn(a, b) * sortDirection),
        [sortBy, array, compareFns, sortDirection],
    )

    const changeSortDirection = () => {
        setSortDirection(
            sortDirection === SortDirection.Ascending
                ? SortDirection.Descending
                : SortDirection.Ascending,
        )
    }

    return {
        sortedArray,
        sortBy,
        setSortBy,
        options: (
            Object.entries(compareFns) as [string, CompareFn<ElementType>][]
        ).map(([key, { name }]) => ({
            key,
            name,
        })),
        sortDirection,
        setSortDirection,
        changeSortDirection,
    }
}
