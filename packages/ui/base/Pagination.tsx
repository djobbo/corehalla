import {
    HiChevronDoubleLeft,
    HiChevronLeft,
    HiChevronRight,
} from "react-icons/hi"
import { Paginator } from "./Paginator"
import { isDefined } from "common/helpers/isDefined"

type PaginationProps = {
    firstPage?: number
    lastPage?: number
    currentPage: number
    baseHref: string
    span?: number
    className?: string
}

export const Pagination = ({
    currentPage,
    baseHref,
    firstPage = 0,
    span = 1,
    className,
}: PaginationProps) => {
    const getPageHref = (page: string) => `${baseHref}/${page}`

    const pages = [
        {
            id: firstPage.toString(),
            label: (
                <span className="flex items-center gap-1">
                    {currentPage !== firstPage && (
                        <HiChevronDoubleLeft className="w-4 h-4" />
                    )}
                    top
                </span>
            ),
            href: getPageHref(firstPage.toString()),
        },
        ...Array.from({ length: 2 * span + 1 }, (_, i) => {
            const page = currentPage + i - span

            if (page <= firstPage) return null

            const label =
                page === currentPage - 1 ? (
                    <span className="flex items-center gap-1">
                        <HiChevronLeft className="w-4 h-4" />
                        prev
                    </span>
                ) : page === currentPage + 1 ? (
                    <span className="flex items-center gap-1">
                        next
                        <HiChevronRight className="w-4 h-4" />
                    </span>
                ) : (
                    page.toString()
                )

            return {
                id: page.toString(),
                label,
                href: getPageHref(page.toString()),
            }
        }),
    ].filter(isDefined)

    return (
        <Paginator
            pages={pages}
            currentPage={currentPage.toString()}
            className={className}
        />
    )
}
