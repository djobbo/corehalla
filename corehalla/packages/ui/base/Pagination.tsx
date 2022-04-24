import {
    ChevronDoubleLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/solid"
import { cn } from "common/helpers/classnames"
import Link from "next/link"
import type { ReactNode } from "react"

type PaginationItemProps = {
    label?: ReactNode
    page: number
    href: string
    className?: string
    activeClassName?: string
    activePage: number
}

const PaginationItem = ({
    label,
    page,
    href,
    className,
    activeClassName = "",
    activePage,
}: PaginationItemProps) => {
    if (page < 0) return null

    return (
        <Link href={href}>
            <a
                className={cn(className, {
                    [activeClassName]: page === activePage,
                })}
            >
                {label ?? page}
            </a>
        </Link>
    )
}

type PaginationProps = {
    firstPage?: number
    lastPage?: number
    currentPage: number
    getPageHref: (page: number) => string
    span?: number
    className?: string
    itemClassName?: string
    itemActiveClassName?: string
}

export const Pagination = ({
    currentPage,
    getPageHref,
    firstPage = 0,
    span = 1,
    className,
    itemClassName,
    itemActiveClassName,
}: PaginationProps) => {
    const pages = [
        {
            page: 1,
            label: (
                <span className="flex items-center gap-1">
                    <ChevronDoubleLeftIcon className="w-4 h-4" />
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
                        <ChevronLeftIcon className="w-4 h-4" />
                        prev
                    </span>
                ) : page === currentPage + 1 ? (
                    <span className="flex items-center gap-1">
                        next
                        <ChevronRightIcon className="w-4 h-4" />
                    </span>
                ) : (
                    page.toString()
                )

            return {
                page,
                label,
            }
        }),
    ]
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {pages.map((pageData) => {
                if (!pageData) return null

                const { page, label } = pageData

                return (
                    <PaginationItem
                        key={page}
                        page={page}
                        label={label}
                        href={getPageHref(page)}
                        className={cn(
                            "p-2 border h-8 flex items-center justify-center text-sm rounded border-blue4",
                            itemClassName,
                        )}
                        activeClassName={cn("bg-blue7", itemActiveClassName)}
                        activePage={currentPage}
                    />
                )
            })}
        </div>
    )
}
