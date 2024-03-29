import { theme } from "../theme"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import NProgress from "nprogress"
import type { ReactNode } from "react"

type PageLoaderProps = {
    children: ReactNode
}

NProgress.configure({ showSpinner: false })

export const PageLoader = ({ children }: PageLoaderProps) => {
    const router = useRouter()

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const handleStart = () => {
            NProgress.start()
            setLoading(true)
        }
        const handleComplete = () => {
            NProgress.done()
            setLoading(false)
        }

        router.events.on("routeChangeStart", handleStart)
        router.events.on("routeChangeComplete", handleComplete)
        router.events.on("routeChangeError", handleComplete)

        return () => {
            router.events.off("routeChangeStart", handleStart)
            router.events.off("routeChangeComplete", handleComplete)
            router.events.off("routeChangeError", handleComplete)
        }
    }, [router.events])

    if (!loading) return null

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
