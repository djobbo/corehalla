import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"

/** Renders after mount so SSR markup matches the client (react-hot-toast uses a portal). */
export const ClientToaster = () => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return <Toaster />
}
