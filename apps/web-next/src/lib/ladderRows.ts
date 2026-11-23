import { legendsMap } from "@crh/bhapi/legends"
import type {
    Rankings1v1Envelope,
    Rankings2v2Envelope,
    Rankings3v3Envelope,
} from "@crh/api-contract/schemas"

export type LadderMember = {
    readonly id: number
    readonly name: string
    readonly slug: string
}

export type LadderLegend = {
    readonly name: string
    readonly nameKey: string
}

export type LadderRow = {
    readonly key: string
    readonly rank: number
    readonly rating: number
    readonly peakRating: number
    readonly tier: string
    readonly games: number
    readonly wins: number
    readonly region: string
    readonly members: readonly LadderMember[]
    /** 1v1 only: the contract carries no per-team legend. */
    readonly legend?: LadderLegend | undefined
}

type BestLegend = Rankings1v1Envelope["data"][number]["best_legend"]

/**
 * A null `best_legend` means the field is unknown, not that the player played
 * no legend, so it renders no icon rather than a placeholder. An id the roster
 * does not know gets the same treatment: an icon key it cannot resolve would be
 * a broken image.
 */
const legendOf = (best: BestLegend): LadderLegend | undefined => {
    if (best === null) return undefined

    const legend = legendsMap[best.id]

    return legend === undefined
        ? undefined
        : { name: legend.bio_name, nameKey: legend.legend_name_key }
}

export const to1v1Rows = (
    envelope: Rankings1v1Envelope,
): readonly LadderRow[] =>
    envelope.data.map((row) => ({
        key: row.slug,
        rank: row.rank,
        rating: row.rating,
        peakRating: row.peak_rating,
        tier: row.tier ?? "Unranked",
        games: row.games,
        wins: row.wins,
        region: row.region,
        members: [{ id: row.id, name: row.name, slug: row.slug }],
        legend: legendOf(row.best_legend),
    }))

export const to2v2Rows = (
    envelope: Rankings2v2Envelope,
): readonly LadderRow[] =>
    envelope.data.map((row) => ({
        key: `${row.team[0].id}-${row.team[1].id}`,
        rank: row.rank,
        rating: row.rating,
        peakRating: row.peak_rating,
        tier: row.tier ?? "Unranked",
        games: row.games,
        wins: row.wins,
        region: row.region,
        // Solo-queue rows use a zero-id phantom partner; drop it.
        members: row.team.filter((member) => member.id > 0),
    }))

export const to3v3Rows = (
    envelope: Rankings3v3Envelope,
): readonly LadderRow[] =>
    envelope.data.map((row) => ({
        key: row.slug,
        rank: row.rank,
        rating: row.rating,
        peakRating: row.peak_rating,
        tier: row.tier ?? "Unranked",
        games: row.games,
        wins: row.wins,
        region: row.region,
        members: [{ id: row.id, name: row.name, slug: row.slug }],
    }))
