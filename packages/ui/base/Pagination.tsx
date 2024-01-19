import { HiChevronDoubleLeft } from "@react-icons/all-files/hi/HiChevronDoubleLeft"
import { HiChevronLeft } from "@react-icons/all-files/hi/HiChevronLeft"
import { HiChevronRight } from "@react-icons/all-files/hi/HiChevronRight"
import { Paginator } from "./Paginator"

type PaginationProps = {
    firstPage?: number
    lastPage?: number
    currentPage: number
    getPageHref: (page: string) => string
    span?: number
    className?: string
}

export const Pagination = ({
    currentPage,
    getPageHref,
    firstPage = 0,
    span = 1,
    className,
}: PaginationProps) => {
    const pages = [
        {
            page: firstPage.toString(),
            label: (
                <span className="flex items-center gap-1">
                    {currentPage !== firstPage && (
                        <HiChevronDoubleLeft className="w-4 h-4" />
                    )}
                    top
                </span>
            ),
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
                page: page.toString(),
                label,
            }
        }),
    ]
    return (
        <Paginator
            pages={pages}
            getPageHref={getPageHref}
            currentPage={currentPage.toString()}
            className={className}
        />
    )
}
