import { adsenseCaPub } from "./gtag"
import { cn } from "../helpers/classnames"
import { useEffect } from "react"

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

export const Adsense = ({
    slot,
    // format = "auto",
    layout = "",
    layoutKey = "",
    // responsive = false,
    className = "",
}: AdsenseProps) => {
    useEffect(() => {
        if (typeof window === "undefined") return

        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
    }, [])

    return (
        <ins
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

export const AdsenseStatsHeader = () => {
    return (
        <Adsense slot="8570143014" responsive className="block w-full h-full" />
    )
}
