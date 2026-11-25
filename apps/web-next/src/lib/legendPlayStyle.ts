import { formatLegendMetaRate } from "./legendMeta"
import { formatMetaCount, metaDisclaimer } from "./metaFloor"

export type { LegendPlayStyle } from "@crh/api-contract/schemas"

/** A metric the sample cannot answer reads as absent, never as a zero. */
export const playStyleUnknown = "—"

/** Two decimals at most, without trailing zeros; `null` when there is no input. */
export const formatPlayStylePerGame = (value: number | null): string =>
    value === null ? playStyleUnknown : value.toFixed(2).replace(/\.?0+$/, "")

/** Whole minutes and seconds of a per-game average. */
export const formatPlayStyleMatchLength = (seconds: number | null): string => {
    if (seconds === null) return playStyleUnknown

    const total = Math.round(seconds)
    const minutes = Math.floor(total / 60)
    const rest = total % 60

    return minutes === 0 ? `${rest}s` : `${minutes}m ${rest}s`
}

export const formatPlayStyleShare = (share: number | null): string =>
    share === null ? playStyleUnknown : formatLegendMetaRate(share)

export const playStyleSample = (accounts: number): string =>
    `Across ${formatMetaCount(accounts)} indexed accounts · ${metaDisclaimer}`
