"use client"

import { type ReactNode } from "react"
import { Select } from "./Select"
import { cn } from "common/helpers/classnames"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"

type PaginatorPage = {
    id: string
    label?: ReactNode
    href: string
    exact?: boolean
}

type PaginatorProps = {
    pages: PaginatorPage[]
    className?: string
    responsive?: boolean
    currentPage?: string
}

export const Paginator = ({
    pages,
    className,
    responsive,
    currentPage: page,
}: PaginatorProps) => {
    const router = useRouter()
    const pathname = usePathname()

    if (pages.length === 0) {
        return null
    }

    const currentPage =
        page ??
        pages.find(({ href, exact }) =>
            exact ? href === pathname : pathname.startsWith(href),
        )?.id

    return (
        <>
            <Select
                className={cn("flex-1 w-full", className, {
                    "block sm:hidden": responsive,
                    hidden: !responsive,
                })}
                onChange={(page) => {
                    const href = pages.find(({ id }) => id === page)?.href
                    if (!href) return

                    router.push(href)
                }}
                value={currentPage || pages[0].id}
                options={pages.map(({ id, label }) => ({
                    value: id,
                    label: (typeof label === "string" && label) || id,
                }))}
            />
            <div
                className={cn("flex items-center gap-2", className, {
                    "hidden sm:flex": responsive,
                })}
            >
                {pages.map(({ id, label, href }) => {
                    return (
                        <Link
                            key={id}
                            href={href}
                            className={cn(
                                "p-2 h-8 flex items-center justify-center text-sm rounded-lg border-bg whitespace-nowrap",
                                {
                                    "bg-accent": id === currentPage,
                                    "bg-bgVar2": id !== currentPage,
                                },
                            )}
                        >
                            {label ?? id}
                        </Link>
                    )
                })}
            </div>
        </>
    )
}
