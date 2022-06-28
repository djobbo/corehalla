import { AppLink } from "./AppLink"
import { cn } from "common/helpers/classnames"
import type { ReactNode } from "react"

export type PaginatorPage = {
    page: string
    label?: ReactNode
}

type PaginatorProps = {
    pages: (PaginatorPage | null)[]
    currentPage: string
    getPageHref: (page: string) => string
    className?: string
}

export const Paginator = ({
    pages,
    currentPage,
    getPageHref,
    className,
}: PaginatorProps) => {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {pages.map((pageData) => {
                if (!pageData) return null

                const { page, label } = pageData

                return (
                    <AppLink
                        key={page}
                        href={getPageHref(page)}
                        className={cn(
                            "p-2 h-8 flex items-center justify-center text-sm rounded-lg border-bg",
                            {
                                "bg-accent": page === currentPage,
                                "bg-bgVar2": page !== currentPage,
                            },
                        )}
                    >
                        {label ?? page}
                    </AppLink>
                )
            })}
        </div>
    )
}
