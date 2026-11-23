import { rankedTiersComplete } from "@crh/bhapi/constants"
import { percent, perGame } from "./stats"
import type { PlayerProfile, PlayerRanked } from "@crh/api-contract/schemas"

type Bracket = NonNullable<PlayerRanked["1v1"]>

export type ComparisonWinner = "a" | "b" | null

export type ComparisonRow = {
    readonly label: string
    readonly a: string
    readonly b: string
    readonly winner: ComparisonWinner
}

type Order = "higher" | "lower"

const MISSING = "—"

const counters = new Intl.NumberFormat("en-US")

const count = (value: number): string => counters.format(value)

const decimal = (value: number): string => value.toFixed(1)

const asPercent = (value: number): string => `${value.toFixed(2)}%`

const betterOf = (
    a: number,
    b: number,
    order: Order = "higher",
): ComparisonWinner => {
    if (a === b) return null

    return (order === "higher" ? a > b : a < b) ? "a" : "b"
}

const toRow = <A>(
    label: string,
    a: A | null,
    b: A | null,
    format: (value: A) => string,
    compare: (left: A, right: A) => ComparisonWinner,
): ComparisonRow => ({
    label,
    a: a === null ? MISSING : format(a),
    b: b === null ? MISSING : format(b),
    winner:
        a === null
            ? b === null
                ? null
                : "b"
            : b === null
              ? "a"
              : compare(a, b),
})

const numberRow = (
    label: string,
    a: number | null,
    b: number | null,
    format: (value: number) => string,
    order: Order = "higher",
): ComparisonRow =>
    toRow(label, a, b, format, (left, right) => betterOf(left, right, order))

const bracketOf = (profile: PlayerProfile): Bracket | null =>
    profile.ranked?.["1v1"] ?? null

const seasonOf = (profile: PlayerProfile): PlayerRanked["stats"] | null =>
    profile.ranked?.stats ?? null

const tierOf = (bracket: Bracket | null): string | null =>
    bracket === null ? null : (bracket.tier ?? "Valhallan")

/** Lower rank index is the better tier; Valhallan sits above the listed ladder. */
const tierRank = (tier: string): number => {
    if (tier === "Valhallan") return -1

    const index = (rankedTiersComplete as readonly string[]).indexOf(tier)

    return index === -1 ? rankedTiersComplete.length : index
}

const tierRow = (a: Bracket | null, b: Bracket | null): ComparisonRow => {
    const left = tierOf(a)
    const right = tierOf(b)

    return toRow(
        "1v1 tier",
        left,
        right,
        (tier) => tier,
        (x, y) => betterOf(tierRank(x), tierRank(y), "lower"),
    )
}

/** Every row is a fact both profiles already carry, in a fixed reading order. */
export const comparePlayers = (
    a: PlayerProfile,
    b: PlayerProfile,
): readonly ComparisonRow[] => {
    const oneA = bracketOf(a)
    const oneB = bracketOf(b)
    const seasonA = seasonOf(a)
    const seasonB = seasonOf(b)

    return [
        numberRow("Account level", a.stats.level, b.stats.level, count),
        numberRow("Account XP", a.stats.xp, b.stats.xp, count),
        numberRow("Career games", a.stats.games, b.stats.games, count),
        numberRow(
            "Career win rate",
            percent(a.stats.wins, a.stats.games),
            percent(b.stats.wins, b.stats.games),
            asPercent,
        ),
        numberRow("KOs", a.stats.kos, b.stats.kos, count),
        numberRow(
            "KOs per game",
            perGame(a.stats.kos, a.stats.games),
            perGame(b.stats.kos, b.stats.games),
            decimal,
        ),
        numberRow(
            "Damage dealt per game",
            perGame(a.stats.damage_dealt, a.stats.games),
            perGame(b.stats.damage_dealt, b.stats.games),
            decimal,
        ),
        numberRow(
            "Falls per game",
            perGame(a.stats.falls, a.stats.games),
            perGame(b.stats.falls, b.stats.games),
            decimal,
            "lower",
        ),
        numberRow(
            "1v1 rating",
            oneA?.rating ?? null,
            oneB?.rating ?? null,
            count,
        ),
        numberRow(
            "1v1 peak",
            oneA?.peak_rating ?? null,
            oneB?.peak_rating ?? null,
            count,
        ),
        tierRow(oneA, oneB),
        numberRow(
            "Season games",
            seasonA?.games ?? null,
            seasonB?.games ?? null,
            count,
        ),
        numberRow(
            "Season win rate",
            seasonA === null ? null : percent(seasonA.wins, seasonA.games),
            seasonB === null ? null : percent(seasonB.wins, seasonB.games),
            asPercent,
        ),
        numberRow(
            "Season glory total",
            seasonA?.glory.total ?? null,
            seasonB?.glory.total ?? null,
            count,
        ),
        numberRow(
            "1v1 Elo reset",
            oneA?.rating_reset ?? null,
            oneB?.rating_reset ?? null,
            count,
        ),
    ]
}
