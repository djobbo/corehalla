import type { Atom } from "effect/unstable/reactivity"
import type * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import { Spinner } from "ui/base/Spinner"
import { useAtomValue } from "@effect/atom-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"

const EMPTY_ROWS: readonly never[] = []

type RankingsPageSliceProps<A> = {
    page: number
    atom: Atom.Atom<AsyncResult.AsyncResult<readonly A[], unknown>>
    onLoaded: (page: number, rows: readonly A[]) => void
}

/**
 * Reads one rankings page and reports it upwards.
 *
 * A page per component keeps the "N pages are loaded" case idiomatic React:
 * each slice subscribes to its own query atom, and the parent only stores the
 * settled arrays.
 */
const RankingsPageSlice = <A,>({
    page,
    atom,
    onLoaded,
}: RankingsPageSliceProps<A>) => {
    const result = useAtomValue(atom)
    const rows = result._tag === "Success" ? result.value : EMPTY_ROWS

    useEffect(() => {
        onLoaded(page, rows)
    }, [page, rows, onLoaded])

    return null
}

export type IndexedRow<A> = {
    row: A
    /** Zero-based position across every loaded page, for row striping. */
    index: number
    /** 1-based page the row came from. */
    page: number
    /** Zero-based position within its page, for tables that show a rank. */
    positionOnPage: number
}

type InfiniteRankingsProps<A> = {
    /** Builds the query atom for a 1-based page. */
    buildAtom: (
        page: number,
    ) => Atom.Atom<AsyncResult.AsyncResult<readonly A[], unknown>>
    /** Page to start on, taken from the URL. */
    initialPage: number
    /** Called when more pages are loaded, so the URL can follow along. */
    onHighestPageChange?: (page: number) => void
    /** Resets the loaded pages when the query/filters change. */
    resetKey: string
    emptyLabel?: string
    children: (
        rows: IndexedRow<A>[],
        state: { isLoading: boolean; hasEarlier: boolean },
    ) => ReactNode
}

/**
 * Appends rankings pages as the user scrolls.
 *
 * Deep links start at the page in the URL and can pull earlier pages in on
 * demand, so a refresh never has to replay every page from the top. The page
 * number is mirrored into the URL by the route through
 * `onHighestPageChange`.
 */
export const InfiniteRankings = <A,>({
    buildAtom,
    initialPage,
    onHighestPageChange,
    resetKey,
    emptyLabel = "No results",
    children,
}: InfiniteRankingsProps<A>) => {
    const [range, setRange] = useState({
        from: Math.max(1, initialPage),
        to: Math.max(1, initialPage),
    })
    const [rowsByPage, setRowsByPage] = useState<
        Record<number, readonly A[]>
    >({})
    const sentinelRef = useRef<HTMLDivElement>(null)
    const isFirstReset = useRef(true)

    // The page from the URL is read during render so the server HTML contains
    // its rows. Further pages arrive through the slices below.
    const firstPage = Math.max(1, initialPage)
    const firstResult = useAtomValue(buildAtom(firstPage))
    const firstRows = firstResult._tag === "Success" ? firstResult.value : undefined
    const resolvedRows = useMemo(
        () =>
            firstRows ? { ...rowsByPage, [firstPage]: firstRows } : rowsByPage,
        [firstRows, firstPage, rowsByPage],
    )

    // Filters or the query changed: start over from the first page. A deep link
    // keeps the page it arrived on, so the initial run is skipped.
    useEffect(() => {
        if (isFirstReset.current) {
            isFirstReset.current = false
            return
        }
        setRange({ from: 1, to: 1 })
        setRowsByPage({})
    }, [resetKey])

    useEffect(() => {
        onHighestPageChange?.(range.to)
    }, [range.to, onHighestPageChange])

    const onLoaded = useCallback((page: number, rows: readonly A[]) => {
        setRowsByPage((previous) =>
            previous[page] === rows ? previous : { ...previous, [page]: rows },
        )
    }, [])

    const rows = useMemo(() => {
        const collected: IndexedRow<A>[] = []

        for (let page = range.from; page <= range.to; page += 1) {
            const pageRows = resolvedRows[page]
            if (!pageRows) continue

            for (const [positionOnPage, row] of pageRows.entries()) {
                collected.push({
                    row,
                    index: collected.length,
                    page,
                    positionOnPage,
                })
            }
        }

        return collected
    }, [range, resolvedRows])

    const isLoading = useMemo(() => {
        for (let page = range.from; page <= range.to; page += 1) {
            if (!resolvedRows[page]) return true
        }
        return false
    }, [range, resolvedRows])

    // An empty page is the end of the table; one extra request is cheaper than
    // hard-coding each endpoint's page size (which differs per environment).
    const lastPageRows = resolvedRows[range.to]
    const mayHaveMore = lastPageRows === undefined || lastPageRows.length > 0
    const hasEarlier = range.from > 1 && !isLoading

    const loadNext = useCallback(() => {
        setRange((current) => ({ ...current, to: current.to + 1 }))
    }, [])

    const loadEarlier = useCallback(() => {
        setRange((current) => ({
            ...current,
            from: Math.max(1, current.from - 1),
        }))
    }, [])

    // Auto-load: the button below stays as the accessible/fallback trigger.
    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !mayHaveMore || isLoading) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) loadNext()
            },
            { rootMargin: "600px 0px" },
        )
        observer.observe(sentinel)

        return () => observer.disconnect()
    }, [isLoading, loadNext, mayHaveMore])

    return (
        <>
            {Array.from({ length: range.to - range.from + 1 }, (_, offset) => {
                const page = range.from + offset

                return (
                    <RankingsPageSlice
                        key={`${resetKey}:${page}`}
                        page={page}
                        atom={buildAtom(page)}
                        onLoaded={onLoaded}
                    />
                )
            })}
            {children(rows, { isLoading, hasEarlier })}
            {!isLoading && rows.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-textVar1">
                    {emptyLabel}
                </p>
            )}
            <div ref={sentinelRef} aria-hidden className="h-px w-full" />
            <div className="flex items-center justify-center gap-3 py-4">
                {hasEarlier && (
                    <button
                        type="button"
                        onClick={loadEarlier}
                        className="cursor-pointer rounded-lg border border-bg bg-bgVar2 px-4 py-2 text-sm font-semibold hover:border-textVar1"
                    >
                        Load earlier rows
                    </button>
                )}
                {isLoading && <Spinner size="1.25rem" color="currentColor" />}
                {!isLoading && mayHaveMore && rows.length > 0 && (
                    <button
                        type="button"
                        onClick={loadNext}
                        className="cursor-pointer rounded-lg border border-bg bg-bgVar2 px-4 py-2 text-sm font-semibold hover:border-textVar1"
                    >
                        Load more
                    </button>
                )}
            </div>
        </>
    )
}
