import { formatLegendMetaRate } from "./legendMeta"
import { formatMetaCount, metaDisclaimer } from "./metaFloor"
import type { FillIntent } from "./fill"
import type { LegendDamageSplit } from "@crh/api-contract/schemas"

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

export type DamageSplitKey =
    | "weaponOne"
    | "weaponTwo"
    | "unarmed"
    | "gadgets"
    | "thrownItem"

export type DamageSplitEntry = {
    readonly key: DamageSplitKey
    readonly label: string
    readonly intent: FillIntent
    readonly share: number
    readonly formatted: string
}

type DamageSplitBucket = Omit<DamageSplitEntry, "formatted" | "share"> & {
    readonly share: number | null
}

/**
 * Where a legend's damage comes from, in reading order. The aggregate emits all
 * five shares or none, so a partial split is a broken sample: the card shows a
 * dash rather than a bar that silently drops a bucket.
 */
export const damageSplitEntries = (
    split: LegendDamageSplit,
    weapons: { readonly one: string; readonly two: string },
): readonly DamageSplitEntry[] | null => {
    const buckets: readonly DamageSplitBucket[] = [
        {
            key: "weaponOne",
            label: weapons.one,
            intent: "blue",
            share: split.weaponOne,
        },
        {
            key: "weaponTwo",
            label: weapons.two,
            intent: "cyan",
            share: split.weaponTwo,
        },
        {
            key: "unarmed",
            label: "Unarmed",
            intent: "green",
            share: split.unarmed,
        },
        {
            key: "gadgets",
            label: "Gadgets",
            intent: "orange",
            share: split.gadgets,
        },
        {
            key: "thrownItem",
            label: "Thrown items",
            intent: "yellow",
            share: split.thrownItem,
        },
    ]

    const present = buckets.filter(
        (bucket): bucket is DamageSplitBucket & { readonly share: number } =>
            bucket.share !== null,
    )

    if (present.length !== buckets.length) return null

    return present.map((bucket) => ({
        ...bucket,
        formatted: formatPlayStyleShare(bucket.share),
    }))
}

export const damageSplitSummary = (
    entries: readonly DamageSplitEntry[],
): string =>
    `Damage split: ${entries
        .map((entry) => `${entry.formatted} ${entry.label}`)
        .join(", ")}`

export const playStyleSample = (accounts: number): string =>
    `Across ${formatMetaCount(accounts)} indexed accounts · ${metaDisclaimer}`
