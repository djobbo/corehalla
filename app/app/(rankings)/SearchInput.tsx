"use client"

import { useDebounce } from "common/hooks/useDebounce"
import { usePathname, useRouter } from "next/navigation"
import { useSearch } from "./SearchProvider"

export const Search = ({
    subtitle,
    placeholder,
    searchParamName,
}: {
    subtitle?: string
    placeholder?: string
    searchParamName: string
}) => {
    const router = useRouter()
    const pathname = usePathname()
    const { search, setSearch, defaultSearch } = useSearch((state) => state)
    const debouncedSearch = useDebounce(search, 500)

    const shouldUpdateSearch = debouncedSearch !== defaultSearch

    if (shouldUpdateSearch) {
        router.push(
            debouncedSearch
                ? `${pathname}?${new URLSearchParams({
                      [searchParamName]: debouncedSearch,
                  })}`
                : pathname,
        )
    }

    return (
        <>
            <input
                value={search}
                onChange={(e) => {
                    setSearch?.(e.target.value)
                }}
                className="w-full mt-4 px-4 py-2 border bg-bgVar2 border-bg rounded-lg"
                placeholder={placeholder}
            />
            {subtitle && (
                <p className="text-center sm:text-left text-sm text-gray-400 mt-2">
                    {subtitle}
                </p>
            )}
        </>
    )
}
