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

export type LadderRow = {
    readonly key: string
    readonly rank: number
    readonly rating: number
    readonly tier: string
    readonly members: readonly LadderMember[]
}

export const to1v1Rows = (
    envelope: Rankings1v1Envelope,
): readonly LadderRow[] =>
    envelope.data.map((row) => ({
        key: row.slug,
        rank: row.rank,
        rating: row.rating,
        tier: row.tier ?? "Unranked",
        members: [{ id: row.id, name: row.name, slug: row.slug }],
    }))

export const to2v2Rows = (
    envelope: Rankings2v2Envelope,
): readonly LadderRow[] =>
    envelope.data.map((row) => ({
        key: `${row.team[0].id}-${row.team[1].id}`,
        rank: row.rank,
        rating: row.rating,
        tier: row.tier ?? "Unranked",
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
        tier: row.tier ?? "Unranked",
        members: [{ id: row.id, name: row.name, slug: row.slug }],
    }))
