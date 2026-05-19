import { useRouterState } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import { cn } from "../helpers/classnames"
import { adsenseCaPub } from "./gtag"

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
    layout = "",
    layoutKey = "",
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
        ></ins>
    )
}

const Adsense = (props: AdsenseProps) => {
    const isNavigating = useRouterState({
        select: (s) => s.status === "pending",
    })
    const [shouldMount, setShouldMount] = useState(true)

    useEffect(() => {
        if (isNavigating) {
            setShouldMount(false)
        } else {
            setShouldMount(true)
        }
    }, [isNavigating])

    return shouldMount ? <Ads {...props} /> : null
}

export const AdsenseStatsHeader = () => {
    return (
        <Adsense slot="8570143014" responsive className="block w-full h-full" />
    )
}
