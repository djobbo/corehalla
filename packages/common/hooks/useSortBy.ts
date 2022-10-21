import { useMemo, useState } from "react"

type CompareFn<ElementType> = {
    label: string
    sortFn: (a: ElementType, b: ElementType) => number
    displayFn?: (element: ElementType) => JSX.Element
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
                .sort(
                    (a, b) => compareFns[sortBy].sortFn(a, b) * sortDirection,
                ),
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
        ).map(([value, { label }]) => ({
            value,
            label,
        })) as { value: Option; label: string }[],
        sortDirection,
        setSortDirection,
        changeSortDirection,
        displaySortFn: compareFns[sortBy].displayFn,
    } as const
}
