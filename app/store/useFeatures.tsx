"use client"

import { type AuthContext } from "@/providers/auth/AuthProvider"
import { type ReactNode, createContext, useContext } from "react"

const __DEV = process.env.NODE_ENV === "development"

import { createStore, useStore } from "zustand"

interface FeatureFlagsStoreProps {
    authContext?: AuthContext
}

type FeatureFlagsStore = ReturnType<typeof createFeatureFlagsStore>

type FeatureFlagsState = {
    // shouldUseVercelImageOptimization: boolean
    shouldShowDummyFavorites: boolean
    shouldShowInfoTooltips: boolean
    shouldShowAds: boolean
}

const createFeatureFlagsStore = ({ authContext }: FeatureFlagsStoreProps) => {
    return createStore<FeatureFlagsState>()(() => ({
        shouldShowDummyFavorites: false && __DEV && !authContext?.isLoggedIn,
        shouldShowInfoTooltips: true, // TODO: Add setting to toggle this
        shouldShowAds: true, // TODO: premium??
    }))
}

const featureFlagsContext = createContext<FeatureFlagsStore | null>(null)

export function useFeatureFlags() {
    const store = useContext(featureFlagsContext)
    if (!store)
        throw new Error("Missing featureFlagsContext.Provider in the tree")
    return useStore(store, (state) => state)
}

type FeatureFlagsProviderProps = FeatureFlagsStoreProps & {
    children: ReactNode
}

export const FeatureFlagsProvider = ({
    children,
    authContext,
}: FeatureFlagsProviderProps) => {
    const store = createFeatureFlagsStore({ authContext })

    return (
        <featureFlagsContext.Provider value={store}>
            {children}
        </featureFlagsContext.Provider>
    )
}
