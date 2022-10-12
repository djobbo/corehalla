import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

type SideNavContext = {
    isSideNavOpen: boolean
    toggleSideNav: () => void
    setIsSideNavOpen: (isOpen: boolean) => void
    openSideNav: () => void
    closeSideNav: () => void
}

const sideNavContext = createContext<SideNavContext>({
    isSideNavOpen: false,
    toggleSideNav: () => void 0,
    setIsSideNavOpen: () => void 0,
    openSideNav: () => void 0,
    closeSideNav: () => void 0,
})

export const useSideNav = (): SideNavContext => useContext(sideNavContext)

interface Props {
    children: ReactNode
}

export const SideNavProvider = ({ children }: Props) => {
    const [isSideNavOpen, setIsSideNavOpen] = useState(false)

    const toggleSideNav = () => setIsSideNavOpen(!isSideNavOpen)
    const openSideNav = () => setIsSideNavOpen(true)
    const closeSideNav = () => setIsSideNavOpen(false)

    return (
        <sideNavContext.Provider
            value={{
                isSideNavOpen,
                setIsSideNavOpen,
                toggleSideNav,
                openSideNav,
                closeSideNav,
            }}
        >
            {children}
        </sideNavContext.Provider>
    )
}
