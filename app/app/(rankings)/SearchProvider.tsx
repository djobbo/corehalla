"use client"

import { type ReactNode, createContext, useContext } from "react"
import { createStore, useStore } from "zustand"

interface SearchStoreProps {
    defaultSearch?: string
}

type SearchStore = ReturnType<typeof createSearchStore>

type SearchState = {
    defaultSearch: string
    search: string
    setSearch: (search: string) => void
}

const createSearchStore = ({ defaultSearch = "" }: SearchStoreProps) => {
    return createStore<SearchState>()((set) => ({
        defaultSearch,
        search: defaultSearch || "",
        setSearch: (search) => set({ search }),
    }))
}

const searchContext = createContext<SearchStore | null>(null)

export function useSearch<T>(selector: (state: SearchState) => T): T {
    const store = useContext(searchContext)
    if (!store) throw new Error("Missing searchContext.Provider in the tree")
    return useStore(store, selector)
}

type SearchProviderProps = SearchStoreProps & {
    children: ReactNode
}

export const SearchProvider = ({
    children,
    defaultSearch,
}: SearchProviderProps) => {
    const store = createSearchStore({ defaultSearch })

    return (
        <searchContext.Provider value={store}>
            {children}
        </searchContext.Provider>
    )
}
