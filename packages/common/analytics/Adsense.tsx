import { adsenseCaPub } from "./gtag"
import { cn } from "../helpers/classnames"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"

declare global {
    interface Window {
        adsbygoogle: { [key: string]: unknown }[]
    }
}

type AdsenseProps = {
    slot: string
    format?: string
    layout?: string
    layoutKey?: string
    responsive?: boolean
    className?: string
}

const Ads = ({
    slot,
    // format = "auto",
    layout = "",
    layoutKey = "",
    // responsive = false,
    className = "",
}: AdsenseProps) => {
    const adsRef = useRef<HTMLModElement | null>(null)

    useEffect(() => {
        if (typeof window === "undefined") return

        const executeWindowAds = () => {
            window.adsbygoogle = window.adsbygoogle || []
            window.adsbygoogle.push({})
        }

        const insHasChildren = adsRef.current?.childNodes.length
        if (!insHasChildren) {
            executeWindowAds()
        }
    }, [])

    return (
        <ins
            ref={adsRef}
            className={cn("adsbygoogle", className)}
            data-ad-client={adsenseCaPub}
            data-ad-slot={slot}
            data-ad-layout={layout}
            data-ad-layout-key={layoutKey}
            // data-ad-format={format}
            // data-full-width-responsive={responsive}
        ></ins>
    )
}

const Adsense = (props: AdsenseProps) => {
    const router = useRouter()
    const [shouldMount, setShouldMount] = useState(true)

    useEffect(() => {
        const onRouteChangeStart = () => setShouldMount(false)
        const onRouteChangeComplete = () => setShouldMount(true)

        router.events.on("routeChangeStart", onRouteChangeStart)
        router.events.on("routeChangeComplete", onRouteChangeComplete)

        return () => {
            router.events.off("routeChangeStart", onRouteChangeStart)
            router.events.off("routeChangeComplete", onRouteChangeComplete)
        }
    }, [router.events])

    return shouldMount ? <Ads {...props} /> : null
}

export const AdsenseStatsHeader = () => {
    return (
        <Adsense slot="8570143014" responsive className="block w-full h-full" />
    )
}
