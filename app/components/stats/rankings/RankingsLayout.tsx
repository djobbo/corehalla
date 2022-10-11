import { Pagination } from "ui/base/Pagination"
import { Paginator } from "ui/base/Paginator"
import type { Dispatch, ReactNode, SetStateAction } from "react"
import type { PaginatorPage } from "ui/base/Paginator"

type RankingsLayoutProps = {
    children: ReactNode
    currentBracket: string
    brackets: PaginatorPage[]
    currentRegion?: string
    regions: PaginatorPage[]
    currentPage?: string
    hasPagination?: boolean
    hasSearch?: boolean
    search?: string
    setSearch?: Dispatch<SetStateAction<string>>
    searchPlaceholder?: string
    searchSubtitle?: string
    defaultRegion?: string
    defaultBracket?: string
}

export const RankingsLayout = ({
    children,
    brackets,
    currentBracket,
    regions,
    currentRegion,
    currentPage,
    hasPagination = false,
    hasSearch = false,
    search,
    setSearch,
    searchPlaceholder = "Search...",
    searchSubtitle,
    defaultRegion = "all",
    defaultBracket = "1v1",
}: RankingsLayoutProps) => {
    const region = regions.map(({ page }) => page).includes(currentRegion ?? "")
        ? currentRegion
        : defaultRegion
    const bracket = brackets.map(({ page }) => page).includes(currentBracket)
        ? currentBracket
        : defaultBracket
    const pagination =
        (currentPage && hasPagination && (
            <Pagination
                getPageHref={(page) =>
                    `/rankings/${bracket}/${region}${page ? `/${page}` : ""}`
                }
                currentPage={parseInt(currentPage)}
                firstPage={1}
                className="justify-end"
            />
        )) ||
        null

    return (
        <>
            <div className="w-full flex flex-col items-center justify-center gap-2">
                <Paginator
                    pages={brackets}
                    currentPage={bracket}
                    getPageHref={(bracket) => `/rankings/${bracket}/${region}`}
                />
                {regions.length > 0 && (
                    <Paginator
                        className="mt-2"
                        pages={regions}
                        currentPage={region ?? ""}
                        getPageHref={(region) =>
                            `/rankings/${bracket}/${region}`
                        }
                    />
                )}
            </div>
            {pagination}
            {hasSearch && (
                <>
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch?.(e.target.value)
                        }}
                        className="w-full mt-8 px-4 py-2 border bg-bgVar2 border-bg rounded-lg"
                        placeholder={searchPlaceholder}
                    />
                    {searchSubtitle && (
                        <p className="text-sm text-gray-400 mt-2">
                            {searchSubtitle}
                        </p>
                    )}
                </>
            )}
            <div className="py-4">{children}</div>
            {pagination}
        </>
    )
}
