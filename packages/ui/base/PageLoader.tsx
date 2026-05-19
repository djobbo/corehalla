import { theme } from "../theme"
import { useRouterState } from "@tanstack/react-router"
import NProgress from "nprogress"
import { useEffect, type ReactNode } from "react"

type PageLoaderProps = {
    children: ReactNode
}

export const PageLoader = ({ children }: PageLoaderProps) => {
    const isLoading = useRouterState({
        select: (s) => s.status === "pending",
    })

    useEffect(() => {
        NProgress.configure({ showSpinner: false })
        if (isLoading) {
            NProgress.start()
        } else {
            NProgress.done()
        }
        return () => {
            NProgress.done()
        }
    }, [isLoading])

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
