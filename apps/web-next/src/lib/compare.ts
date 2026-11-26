import { rankedTiersComplete } from "@crh/bhapi/constants"
import { rankedBracketState } from "./season"
import { percent, perGame } from "./stats"
import type {
    LegendBubble,
    PlayerProfile,
    PlayerRanked,
} from "@crh/api-contract/schemas"

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

/** A rate over zero games is unknown, not zero: the row dashes and has no winner. */
const perGameOf = (value: number, games: number): number | null =>
    games === 0 ? null : perGame(value, games)

const percentOf = (value: number, total: number): number | null =>
    total === 0 ? null : percent(value, total)

/** The most shared legends one screen lists before stating the remainder. */
export const SHARED_LEGEND_LIMIT = 10

export type SharedLegendSide = {
    readonly games: number
    readonly wins: number
    readonly level: number
}

export type SharedLegendRow = {
    readonly id: number
    readonly name: string
    readonly nameKey: string
    readonly slug: string
    readonly a: SharedLegendSide
    readonly b: SharedLegendSide
    readonly combinedGames: number
}

export type SharedLegends = {
    readonly rows: readonly SharedLegendRow[]
    /** Overlapping legends the cap leaves out. */
    readonly hidden: number
}

export const legendWinRate = (side: SharedLegendSide): string =>
    side.games === 0 ? MISSING : asPercent(percent(side.wins, side.games))

const sideOf = (legend: LegendBubble): SharedLegendSide => ({
    games: legend.games,
    wins: legend.wins,
    level: legend.level,
})

const sharedRow = (
    legend: LegendBubble,
    opponent: LegendBubble,
): SharedLegendRow => ({
    id: legend.id,
    name: legend.name,
    nameKey: legend.name_key,
    slug: legend.slug,
    a: sideOf(legend),
    b: sideOf(opponent),
    combinedGames: legend.games + opponent.games,
})

/** The legends both players have played, heaviest combined pool first. */
export const sharedLegends = (
    a: PlayerProfile,
    b: PlayerProfile,
): SharedLegends => {
    const opponentById = new Map(
        b.legend_bubbles.map((legend) => [legend.id, legend]),
    )

    const shared = a.legend_bubbles
        .flatMap((legend) => {
            const opponent = opponentById.get(legend.id)

            return opponent === undefined ||
                legend.games <= 0 ||
                opponent.games <= 0
                ? []
                : [sharedRow(legend, opponent)]
        })
        .sort((left, right) => right.combinedGames - left.combinedGames)

    return {
        rows: shared.slice(0, SHARED_LEGEND_LIMIT),
        hidden: Math.max(0, shared.length - SHARED_LEGEND_LIMIT),
    }
}

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

const PLACEMENTS = "Placements"

const tierOf = (bracket: Bracket | null): string | null => {
    const state = rankedBracketState(bracket)

    return state.kind === "missing"
        ? null
        : state.kind === "placements"
          ? PLACEMENTS
          : state.tier
}

/** Lower rank index is the better tier; Valhallan sits above the listed ladder. */
const tierRank = (tier: string): number => {
    if (tier === "Valhallan") return -1

    const index = (rankedTiersComplete as readonly string[]).indexOf(tier)

    return index === -1 ? rankedTiersComplete.length : index
}

const tierRow = (a: Bracket | null, b: Bracket | null): ComparisonRow => {
    const left = tierOf(a)
    const right = tierOf(b)

    // A placement hides the rating, so the row can neither rank nor award it.
    if (left === PLACEMENTS || right === PLACEMENTS) {
        return {
            label: "1v1 tier",
            a: left ?? MISSING,
            b: right ?? MISSING,
            winner: null,
        }
    }

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
            percentOf(a.stats.wins, a.stats.games),
            percentOf(b.stats.wins, b.stats.games),
            asPercent,
        ),
        numberRow("KOs", a.stats.kos, b.stats.kos, count),
        numberRow(
            "KOs per game",
            perGameOf(a.stats.kos, a.stats.games),
            perGameOf(b.stats.kos, b.stats.games),
            decimal,
        ),
        numberRow(
            "Damage dealt per game",
            perGameOf(a.stats.damage_dealt, a.stats.games),
            perGameOf(b.stats.damage_dealt, b.stats.games),
            decimal,
        ),
        numberRow(
            "Falls per game",
            perGameOf(a.stats.falls, a.stats.games),
            perGameOf(b.stats.falls, b.stats.games),
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
            seasonA === null ? null : percentOf(seasonA.wins, seasonA.games),
            seasonB === null ? null : percentOf(seasonB.wins, seasonB.games),
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
