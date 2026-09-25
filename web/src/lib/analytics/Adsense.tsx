import { ADSENSE_SLOTS, adsenseCaPub, adsenseEnabled } from "./gtag"
import { cn } from "common/helpers/classnames"
import { useFeatureFlags } from "@hooks/useFeatures"
import { useRouterState } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import type { CSSProperties } from "react"

/**
 * Google AdSense manual ad units.
 *
 * Only the placements exported at the bottom of this file are rendered by the
 * app; there is deliberately no "auto" ad component. Site-wide Auto ads (the
 * in-feed/anchor/vignette formats that put ads on every page, including
 * full-screen interstitials) are an account-level setting and must be turned
 * off in AdSense — see `web/.env.example` for the dashboard path. Disabling
 * them there leaves exactly these units.
 */

type AdsenseFormat = "auto" | "fluid" | "horizontal" | "rectangle" | "vertical"

type AdsenseProps = {
    /** Ad unit ID from the AdSense dashboard. */
    slot: string
    format?: AdsenseFormat
    layout?: string
    layoutKey?: string
    /** Let the unit size itself to the container. */
    responsive?: boolean
    fullWidthResponsive?: boolean
    className?: string
    style?: CSSProperties
}

const Ads = ({
    slot,
    format,
    layout,
    layoutKey,
    responsive = false,
    fullWidthResponsive = true,
    className,
    style,
}: AdsenseProps) => {
    const adsRef = useRef<HTMLModElement | null>(null)
    const pushed = useRef(false)

    useEffect(() => {
        if (pushed.current) return

        const node = adsRef.current
        if (!node) return

        // AdSense marks a unit once it has been filled. Pushing twice would
        // request a second ad into the same element, so skip filled units.
        if (node.getAttribute("data-adsbygoogle-status")) return

        // A unit inside a hidden/zero-sized container cannot be measured by
        // AdSense, and `push` throws for it. Leave it unpushed instead: the
        // error would otherwise reach the router's error boundary, which
        // remounts this component, which pushes again — an infinite loop that
        // shows up as Google's tag hook running forever.
        const { width, height } = node.getBoundingClientRect()
        if (width === 0 || height === 0) return

        pushed.current = true
        window.adsbygoogle = window.adsbygoogle || []

        try {
            window.adsbygoogle.push({})
        } catch {
            // Ad tag errors must never take the page down.
        }
    }, [])

    return (
        <ins
            ref={adsRef}
            // `isolate` contains whatever stacking the ad creative sets
            // internally, so it can never paint over the app's dropdowns.
            className={cn("adsbygoogle block isolate", className)}
            style={style}
            data-ad-client={adsenseCaPub}
            data-ad-slot={slot}
            {...(format ? { "data-ad-format": format } : {})}
            {...(layout ? { "data-ad-layout": layout } : {})}
            {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
            {...(responsive
                ? {
                      "data-full-width-responsive": fullWidthResponsive
                          ? "true"
                          : "false",
                  }
                : {})}
        ></ins>
    )
}

/**
 * A single ad unit.
 *
 * The unit is keyed by pathname so client-side navigations (player A -> player
 * B) replace the `<ins>` instead of leaving the previous ad in place. Each
 * replacement pushes once for itself.
 */
export const Adsense = (props: AdsenseProps) => {
    const pathname = useRouterState({
        select: (state) => state.location.pathname,
    })

    return <Ads key={pathname} {...props} />
}

export type AdsensePlacement =
    | "profileHeader"
    | "profileBottom"
    | "articles"
    | "rankings"
    | "landingSearch"

type PlacementConfig = Omit<AdsenseProps, "slot">

/**
 * Format and sizing defaults per placement. Everything stays responsive so a
 * unit adapts to the slot it was given instead of forcing a fixed creative
 * size; the thin slots ask for horizontal creatives.
 */
const PLACEMENTS: Record<AdsensePlacement, PlacementConfig> = {
    profileHeader: {
        format: "horizontal",
        responsive: true,
        className: "absolute inset-0 h-full w-full",
    },
    profileBottom: {
        format: "auto",
        responsive: true,
        className: "w-full min-h-[100px]",
    },
    /** Last card of the landing news column, deliberately small. */
    articles: {
        format: "horizontal",
        responsive: true,
        className: "w-full min-h-[70px]",
    },
    rankings: {
        format: "horizontal",
        responsive: true,
        className: "w-full min-h-[90px]",
    },
    landingSearch: {
        format: "horizontal",
        responsive: true,
        className: "w-full min-h-[90px]",
    },
}

type AdsensePlacementProps = {
    placement: AdsensePlacement
    className?: string
}

/**
 * Renders one configured placement, or nothing when ads are disabled or no
 * publisher ID is set (local development without AdSense credentials). Because
 * the whole node is dropped, a disabled placement leaves no empty gap.
 */
const AdsenseUnit = ({ placement, className }: AdsensePlacementProps) => {
    const { shouldShowAds } = useFeatureFlags()

    if (!shouldShowAds || !adsenseEnabled) return null

    const config = PLACEMENTS[placement]

    return (
        <Adsense
            {...config}
            slot={ADSENSE_SLOTS[placement]}
            className={cn(config.className, className)}
        />
    )
}

/**
 * Overlays the static profile banner. The parent owns the size
 * (`h-28 max-h-28 overflow-hidden`), so the unit can never grow beyond it; the
 * banner image stays visible behind an unfilled unit.
 */
export const AdsenseStatsHeader = () => (
    <AdsenseUnit placement="profileHeader" />
)

/** Page-level unit at the bottom of a player/clan profile. */
export const AdsenseProfileBottom = ({ className }: { className?: string }) => (
    <AdsenseUnit placement="profileBottom" className={className} />
)

/** Last (small) card of the landing page news column. */
export const AdsenseArticles = ({ className }: { className?: string }) => (
    <AdsenseUnit placement="articles" className={className} />
)

/** Small unit between the rankings search bar and the table. */
export const AdsenseRankings = ({ className }: { className?: string }) => (
    <AdsenseUnit placement="rankings" className={className} />
)

/** Unit below the landing page search bar; matches the rankings unit. */
export const AdsenseLandingSearch = ({ className }: { className?: string }) => (
    <AdsenseUnit placement="landingSearch" className={className} />
)
