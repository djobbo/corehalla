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
    inactiveClassName?: string
    activePage: number
}

const PaginationItem = ({
    label,
    page,
    href,
    className,
    activeClassName = "",
    inactiveClassName = "",
    activePage,
}: PaginationItemProps) => {
    if (page < 0) return null

    return (
        <Link href={href}>
            <a
                className={cn(className, {
                    [activeClassName]: page === activePage,
                    [inactiveClassName]: page !== activePage,
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
            page: firstPage,
            label: (
                <span className="flex items-center gap-1">
                    {currentPage !== firstPage && (
                        <ChevronDoubleLeftIcon className="w-4 h-4" />
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
                        className="p-2 h-8 flex items-center justify-center text-sm rounded-lg border-bg"
                        activeClassName="bg-accent"
                        inactiveClassName="bg-bgVar2"
                        activePage={currentPage}
                    />
                )
            })}
        </div>
    )
}
