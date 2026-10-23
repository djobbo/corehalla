import { theme } from "../theme"
import { useEffect } from "react"
import { useRouterState } from "@tanstack/react-router"
import NProgress from "nprogress"
import type { ReactNode } from "react"

type PageLoaderProps = {
    children: ReactNode
}

NProgress.configure({ showSpinner: false })

/**
 * Route-transition progress indicator.
 *
 * The Next.js version subscribed to `router.events`. TanStack Router exposes
 * the same signal through router state, so this subscribes to `isLoading`.
 */
export const PageLoader = ({ children }: PageLoaderProps) => {
    const isLoading = useRouterState({ select: (state) => state.isLoading })

    useEffect(() => {
        if (isLoading) {
            NProgress.start()
        } else {
            NProgress.done()
        }
    }, [isLoading])

    useEffect(() => {
        return () => {
            NProgress.done()
        }
    }, [])

    if (!isLoading) return null

    return (
        <div
            className="fixed inset-x-0 bottom-0 flex items-end justify-end z-50 p-4 pointer-events-none"
            style={{
                background: `linear-gradient(to top, ${theme.colors.bgVar1}, rgba(0, 0, 0, 0))`,
            }}
        >
            {children}
        </div>
    )
}
