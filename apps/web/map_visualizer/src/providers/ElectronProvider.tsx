import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

const ElectronContext = createContext(false)

export const useElectron = (): boolean => useContext(ElectronContext)

interface Props {
    children: ReactNode
}

export function ElectronProvider({ children }: Props): JSX.Element {
    const [isElectron, setIsElectron] = useState(false)

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase()
        setIsElectron(userAgent.indexOf(' electron/') > -1)
    }, [])

    return <ElectronContext.Provider value={isElectron}>{children}</ElectronContext.Provider>
}
