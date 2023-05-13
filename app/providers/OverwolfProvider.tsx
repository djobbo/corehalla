import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

export type OverwolfContext = {
    overwolf: typeof window.overwolf | null
    isOverwolfContext: boolean
    isLoadingOverwolf: boolean
    isOverwolfError: boolean
}

const overwolfContext = createContext<OverwolfContext>({
    overwolf: null,
    isOverwolfContext: false,
    isLoadingOverwolf: false,
    isOverwolfError: false,
})

export const useOverwolf = (): OverwolfContext => useContext(overwolfContext)

type OverwolfProviderProps = {
    children: ReactNode
}

const isOverwolfLoading = (): boolean => {
    return !window.overwolf || !window.overwolf.windows
}

export const waitForOverwolf = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!isOverwolfLoading()) {
            return resolve()
        }

        let retriesLeft = 10
        setInterval(() => {
            if (isOverwolfLoading()) {
                if (retriesLeft <= 0) {
                    return reject(new Error("Overwolf failed to load"))
                }

                retriesLeft--
            } else {
                resolve()
            }
        }, 1000)
    })
}

export const OverwolfProvider = ({ children }: OverwolfProviderProps) => {
    const [isOverwolfContext, setIsOverwolfContext] = useState(false)
    const [isLoadingOverwolf, setIsLoadingOverwolf] = useState(true)
    const [overwolf, setOverwolf] = useState<typeof window.overwolf | null>(
        null,
    )
    useEffect(() => {
        const isOverwolfCtx = navigator.userAgent.includes("OverwolfClient")
        setIsOverwolfContext(isOverwolfCtx)
        if (!isOverwolfCtx) {
            setIsLoadingOverwolf(false)
            return
        }

        waitForOverwolf()
            .then(() => {
                setOverwolf(window.overwolf)
            })
            .finally(() => {
                setIsLoadingOverwolf(false)
            })
    }, [])

    return (
        <overwolfContext.Provider
            value={{
                isOverwolfContext,
                isLoadingOverwolf,
                isOverwolfError:
                    isOverwolfContext && !isLoadingOverwolf && !overwolf,
                overwolf,
            }}
        >
            {children}
        </overwolfContext.Provider>
    )
}
