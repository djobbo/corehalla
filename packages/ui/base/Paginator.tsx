import { AppLink } from "./AppLink"
import { Select } from "./Select"
import { cn } from "common/helpers/classnames"
import { useRouter } from "next/router"
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
    responsive?: boolean
}

export const Paginator = ({
    pages,
    currentPage,
    getPageHref,
    className,
    responsive,
}: PaginatorProps) => {
    const router = useRouter()

    return (
        <>
            <Select
                className={cn("flex-1 w-full", className, {
                    "block sm:hidden": responsive,
                    hidden: !responsive,
                })}
                onChange={(page) => {
                    router.push(getPageHref(page))
                }}
                value={currentPage}
                options={pages.map((page) => ({
                    label:
                        typeof page?.label === "string"
                            ? page.label
                            : page?.page ?? "",
                    value: page?.page ?? "",
                }))}
            />
            <div
                className={cn("flex items-center gap-2", className, {
                    "hidden sm:flex": responsive,
                })}
            >
                {pages.map((pageData) => {
                    if (!pageData) return null

                    const { page, label } = pageData

                    return (
                        <AppLink
                            key={page}
                            href={getPageHref(page)}
                            className={cn(
                                "p-2 h-8 flex items-center justify-center text-sm rounded-lg border-bg whitespace-nowrap",
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
        </>
    )
}
