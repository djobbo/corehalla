import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

type Order = 'asc' | 'desc'
type GetSortedProp<T> = (item: T) => number
type GetSortedDisplay<T> = (item: T) => string

export const useSort = <Sort extends string, T = unknown>(
    defaultSort: Sort,
    getSortedProps: Record<Sort, GetSortedProp<T>>,
    getSortedDisplays?: Record<Sort, GetSortedDisplay<T>>,
): {
    sort: (array: T[]) => T[]
    setActiveSort: Dispatch<SetStateAction<Sort>>
    order: Order
    setOrder: (ord: Order) => void
    getDisplayStr: (item: T) => string
} => {
    const { query } = useRouter()
    const [activeSort, setActiveSort] = useState<Sort>((query.sort ?? defaultSort) as Sort)
    const [order, setOrder] = useState<Order>('desc')

    useEffect(() => {
        setActiveSort((query.sort ?? defaultSort) as Sort)
    }, [query.sort])

    const sort = (array: T[]): T[] => {
        const getSortedProp = (a: T, b: T): number => {
            const getSortedProp = getSortedProps[activeSort] ?? getSortedProps[defaultSort]

            if (!getSortedProp) return 0

            return getSortedProp(a) - getSortedProp(b)
        }

        return activeSort ? array.sort((a, b) => getSortedProp(a, b) * (order === 'desc' ? -1 : 1)) : array
    }

    return {
        sort,
        setActiveSort,
        order,
        setOrder,
        getDisplayStr: (item: T) => (getSortedDisplays?.[activeSort] ?? getSortedDisplays?.[defaultSort])(item) ?? '',
    }
}
