import { useState, createContext, useContext, ReactNode } from 'react'

interface ISideNavContext {
    sideNavOpen: boolean
    setSideNavOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SideNavContext = createContext<ISideNavContext>({
    sideNavOpen: false,
    setSideNavOpen: () => ({}),
})

export const useSideNavContext = (): ISideNavContext => useContext(SideNavContext)

interface Props {
    children: ReactNode
}

export function SideNavProvider({ children }: Props): JSX.Element {
    const [sideNavOpen, setSideNavOpen] = useState(false)

    return <SideNavContext.Provider value={{ sideNavOpen, setSideNavOpen }}>{children}</SideNavContext.Provider>
}
