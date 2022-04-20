import { IRanking1v1Format } from '@corehalla/core/types'
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react'

import { useDebounceValue } from '~hooks/useDebounce'

import { Option } from '@Select'

interface SearchContext {
    search: string
    debouncedSearch: string
    setSearch: Dispatch<SetStateAction<string>>
    isLoading: boolean
    options: Option<string>[]
    rankings: IRanking1v1Format[]
}

const searchContext = createContext<SearchContext>({
    search: '',
    debouncedSearch: '',
    setSearch: () => ({}),
    isLoading: false,
    options: [],
    rankings: [],
})

export const useSearch = (): SearchContext => useContext(searchContext)

interface Props {
    children: ReactNode
}

export const SearchProvider = ({ children }: Props): JSX.Element => {
    const [search, debouncedSearch, setSearch, isLoading] = useDebounceValue('', 500)
    const [options, setOptions] = useState<Option<string>[]>([])
    const [rankings, setRankings] = useState<IRanking1v1Format[]>([])
    const [filteredRankings, setFilteredRankings] = useState<IRanking1v1Format[]>([])

    useEffect(() => {
        if (!debouncedSearch) return
        ;(async () => {
            try {
                const res = await fetch(`/api/rankings/1v1/ALL/1?p=${debouncedSearch}`)
                const data = (await res.json()) as IRanking1v1Format[]
                setRankings(data)
            } catch {}
        })()
    }, [debouncedSearch])

    useEffect(() => {
        setFilteredRankings(
            !search
                ? rankings
                : rankings.filter((ranking) => ranking.name.toLowerCase().includes(search.toLowerCase())),
        )
    }, [rankings, search])

    useEffect(() => {
        setOptions(
            filteredRankings.map<Option<string>>((player) => ({
                value: player.id.toString(),
                label: player.name,
            })),
        )
    }, [filteredRankings])

    return (
        <searchContext.Provider
            value={{ rankings: filteredRankings, search, debouncedSearch, setSearch, isLoading, options }}
        >
            {children}
        </searchContext.Provider>
    )
}
