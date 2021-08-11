import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react'

import { useDebounceValue } from '~hooks/useDebounce'
import { IRanking1v1Format } from '@corehalla/core/types'
import { useFavorites } from './FavoritesProvider'
import { Option } from '@Select'

interface SearchContext {
    search: string
    debouncedSearch: string
    setSearch: Dispatch<SetStateAction<string>>
    isLoading: boolean
    options: Option<string>[]
}

const searchContext = createContext<SearchContext>({
    search: '',
    debouncedSearch: '',
    setSearch: () => ({}),
    isLoading: false,
    options: [],
})

export const useSearch = (): SearchContext => useContext(searchContext)

interface Props {
    children: ReactNode
}

export const SearchProvider = ({ children }: Props): JSX.Element => {
    const [search, debouncedSearch, setSearch, isLoading] = useDebounceValue('', 500)

    const { favorites } = useFavorites()

    const [options, setOptions] = useState<Option<string>[]>(
        favorites
            .filter((fav) => fav.type === 'player')
            .map((player) => ({ value: player.favorite_id, label: player.label })),
    )

    useEffect(() => {
        if (!debouncedSearch) return
        ;(async () => {
            try {
                const res = await fetch(`/api/rankings/1v1/ALL/1?p=${debouncedSearch}`)
                const data = (await res.json()) as IRanking1v1Format[]
                setOptions(data.map<Option<string>>((player) => ({ value: player.id.toString(), label: player.name })))
            } catch {}
        })()
    }, [debouncedSearch])

    return (
        <searchContext.Provider value={{ search, debouncedSearch, setSearch, isLoading, options }}>
            {children}
        </searchContext.Provider>
    )
}
