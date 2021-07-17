import { useRouter } from 'next/router'
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react'

interface TabsContext<TabName extends string = string> {
    tab: TabName
    setTab: Dispatch<SetStateAction<TabName>>
}

const tabsContext = createContext<TabsContext>({
    tab: '',
    setTab: () => ({}),
})

export const useTabs = <TabName extends string = string>(): TabsContext<TabName> =>
    useContext(tabsContext) as TabsContext<TabName>

interface Props<TabName extends string = string> {
    children: ReactNode
    defaultTab: TabName
}

export const TabsProvider = <TabName extends string = string>({
    children,
    defaultTab,
}: Props<TabName>): JSX.Element => {
    const { query } = useRouter()
    const [tab, setTab] = useState<TabName>((query.tab ?? defaultTab) as TabName)

    useEffect(() => {
        setTab((query.tab ?? defaultTab) as TabName)
    }, [query.tab])

    return (
        <tabsContext.Provider
            value={{
                tab,
                setTab,
            }}
        >
            {children}
        </tabsContext.Provider>
    )
}
