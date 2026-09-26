import { Spinner } from "ui/base/Spinner"
import { AppLink } from "ui/base/AppLink"
import { cn } from "common/helpers/classnames"
import { useAtomValue } from "@effect/atom-react"
import { HiChevronLeft } from "@react-icons/all-files/hi/HiChevronLeft"
import { HiChevronRight } from "@react-icons/all-files/hi/HiChevronRight"
import type { Atom } from "effect/unstable/reactivity"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import type { ReactNode } from "react"

const EMPTY_ROWS: readonly never[] = []

export type IndexedRow<A> = {
    row: A
    /** Zero-based position across the whole result set, for row striping. */
    index: number
    /** 1-based page the row came from. */
    page: number
    /** Zero-based position within its page, for tables that show a rank. */
    positionOnPage: number
}

type PaginatedRankingsProps<A> = {
    /** Builds the query atom for a 1-based page. */
    buildAtom: (
        page: number,
    ) => Atom.Atom<AsyncResult.AsyncResult<readonly A[], unknown>>
    /** Current 1-based page, taken from the URL. */
    page: number
    /**
     * Rows per page, used to keep `index` continuous across pages.
     *
     * The endpoints own their page size (`*_PER_PAGE` constants, one of which
     * differs between dev and production), so the caller passes it rather than
     * this component guessing.
     */
    pageSize: number
    /** Resets the loaded page when the query/filters change. */
    resetKey: string
    /**
     * Builds the link for another page.
     *
     * The page lives in a path segment on these routes and the other filters
     * (`q`, `sortBy`, region) live in the query string, so only the route knows
     * how to spell a page URL and which state to carry across.
     */
    pageHref: (page: number) => string
    emptyLabel?: string
    children: (rows: IndexedRow<A>[]) => ReactNode
}

/**
 * One page of a rankings table, with prev/next controls.
 *
 * Deliberately not an infinite list. Paging depth is what makes a ranked search
 * expensive: every extra page is another `OFFSET` walk in D1, and the server
 * refuses pages past `SEARCH_MAX_PAGES` anyway. A fixed page with explicit
 * navigation keeps the URL the single source of truth for what is on screen, so
 * a page is shareable and a refresh never replays the pages above it.
 */
export const PaginatedRankings = <A,>({
    buildAtom,
    page,
    pageSize,
    resetKey,
    pageHref,
    emptyLabel = "No results",
    children,
}: PaginatedRankingsProps<A>) => {
    const result = useAtomValue(buildAtom(page))

    const rows: readonly A[] =
        result._tag === "Success" ? result.value : EMPTY_ROWS
    // `AsyncResult` has no dedicated loading state: a request in flight is
    // still `Initial` (or waiting on a refresh), and `isWaiting` is what tells
    // "nothing yet" apart from "settled with no rows".
    const isLoading = AsyncResult.isWaiting(result)

    // The page is loaded in one shot, so a full page is the only signal that
    // the next one might exist: an exactly-full last page costs one extra
    // empty request, which is cheaper than threading a total count through
    // every endpoint.
    const mayHaveMore = rows.length >= pageSize
    const hasPrevious = page > 1

    const indexed: IndexedRow<A>[] = rows.map((row, positionOnPage) => ({
        row,
        index: (page - 1) * pageSize + positionOnPage,
        page,
        positionOnPage,
    }))

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="1.5rem" color="currentColor" />
            </div>
        )
    }

    if (rows.length === 0) {
        return (
            <p className="px-4 py-8 text-center text-sm text-textVar1">
                {emptyLabel}
            </p>
        )
    }

    return (
        <>
            {children(indexed)}
            <div
                key={resetKey}
                className="flex items-center justify-center gap-3 py-4"
            >
                {hasPrevious ? (
                    <AppLink
                        href={pageHref(page - 1)}
                        className="flex items-center gap-1 rounded-lg border border-bg bg-bgVar2 px-4 py-2 text-sm font-semibold hover:border-textVar1"
                    >
                        <HiChevronLeft className="h-4 w-4" />
                        Previous
                    </AppLink>
                ) : (
                    <span
                        aria-disabled
                        className={cn(
                            "flex items-center gap-1 rounded-lg border border-bg bg-bgVar2 px-4 py-2 text-sm font-semibold",
                            "cursor-not-allowed opacity-40",
                        )}
                    >
                        <HiChevronLeft className="h-4 w-4" />
                        Previous
                    </span>
                )}
                <span className="text-sm text-textVar1">Page {page}</span>
                {mayHaveMore ? (
                    <AppLink
                        href={pageHref(page + 1)}
                        className="flex items-center gap-1 rounded-lg border border-bg bg-bgVar2 px-4 py-2 text-sm font-semibold hover:border-textVar1"
                    >
                        Next
                        <HiChevronRight className="h-4 w-4" />
                    </AppLink>
                ) : (
                    <span
                        aria-disabled
                        className={cn(
                            "flex items-center gap-1 rounded-lg border border-bg bg-bgVar2 px-4 py-2 text-sm font-semibold",
                            "cursor-not-allowed opacity-40",
                        )}
                    >
                        Next
                        <HiChevronRight className="h-4 w-4" />
                    </span>
                )}
            </div>
        </>
    )
}
