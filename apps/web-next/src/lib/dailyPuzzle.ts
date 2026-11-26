import { legends, legendsMap } from "@crh/bhapi/legends"
import type { Legend } from "@crh/bhapi/types"
import { Option, Schema } from "effect"
import { legendAttributes } from "./legends"

export const MAX_DAILY_GUESSES = 6

/** A stretch of the calendar answered by one ordered pool of keys. */
export type DailyAnswerPool = {
    readonly from: string
    readonly keys: readonly string[]
}

/**
 * The first date answered from the whole roster instead of the 40 keys the
 * puzzle launched with. It stays ahead of any round a player can have played.
 */
export const dailyRosterCutover = "2027-01-01"

/**
 * The pools, in calendar order. Inside a pool the answer is
 * `daysSince(from) % keys.length`, so a pool's keys are frozen once dates in it
 * have shipped: appending a key changes the cycle length and rewrites every
 * answer in that pool, including rounds already played.
 *
 * To bring a new legend into the rotation, add it to a pool whose `from` is
 * still in the future and that lists the whole roster in its new order; once a
 * pool has started, the addition belongs in a new pool further down the list.
 * Never edit the 2026 pool.
 */
export const dailyAnswerPools: readonly DailyAnswerPool[] = [
    {
        from: "2026-01-01",
        keys: [
            "bodvar",
            "mordex",
            "queen nai",
            "koji",
            "cassidy",
            "mirage",
            "thatch",
            "diana",
            "orion",
            "jiro",
            "gnash",
            "artemis",
            "lord vraxx",
            "yumiko",
            "hattori",
            "caspian",
            "sir roland",
            "xull",
            "scarlet",
            "kaya",
            "ada",
            "fait",
            "sentinel",
            "dusk",
            "lucien",
            "petra",
            "teros",
            "volkov",
            "brynn",
            "onyx",
            "asuri",
            "jaeyun",
            "barraza",
            "mako",
            "ember",
            "magyar",
            "azoth",
            "reno",
            "ulgrim",
            "munin",
        ],
    },
    {
        from: dailyRosterCutover,
        keys: [
            "bodvar",
            "cassidy",
            "orion",
            "lord vraxx",
            "gnash",
            "queen nai",
            "hattori",
            "sir roland",
            "scarlet",
            "thatch",
            "ada",
            "sentinel",
            "lucien",
            "teros",
            "brynn",
            "asuri",
            "barraza",
            "ember",
            "azoth",
            "koji",
            "ulgrim",
            "diana",
            "jhala",
            "kor",
            "wu shang",
            "val",
            "ragnir",
            "cross",
            "mirage",
            "nix",
            "mordex",
            "yumiko",
            "artemis",
            "caspian",
            "sidra",
            "xull",
            "kaya",
            "isaiah",
            "jiro",
            "lin fei",
            "zariel",
            "rayman",
            "dusk",
            "fait",
            "thor",
            "petra",
            "vector",
            "volkov",
            "onyx",
            "jaeyun",
            "mako",
            "magyar",
            "reno",
            "munin",
            "arcadia",
            "ezio",
            "tezca",
            "thea",
            "redraptor",
            "loki",
            "seven",
            "vivi",
            "imugi",
            "king zuva",
            "priya",
            "ransom",
            "lady vera",
            "rupture",
            "aurus",
            "qinghua & baobao",
        ],
    },
]

const DAY_MS = 86_400_000

const dayTime = (dateKey: string): number =>
    Date.parse(`${dateKey}T00:00:00.000Z`)

const poolLegends = dailyAnswerPools.map((pool) => ({
    from: pool.from,
    legends: pool.keys.flatMap((key) => {
        const legend = legends.find((entry) => entry.legend_name_key === key)

        return legend === undefined ? [] : [legend]
    }),
}))

/** A date before the first pool keeps wrapping through it, as it always has. */
const poolFor = (dateKey: string) => {
    for (let index = poolLegends.length - 1; index >= 0; index -= 1) {
        const pool = poolLegends[index]

        if (pool.from <= dateKey) return pool
    }

    return poolLegends[0]
}

/** The UTC calendar day a moment belongs to, as `YYYY-MM-DD`. */
export const dailyDateKey = (date: Date): string =>
    date.toISOString().slice(0, 10)

const previousDateKey = (dateKey: string): string =>
    dailyDateKey(new Date(dayTime(dateKey) - DAY_MS))

export const dailyAnswer = (dateKey: string): Legend => {
    const pool = poolFor(dateKey)
    const index =
        Math.round((dayTime(dateKey) - dayTime(pool.from)) / DAY_MS) %
        pool.legends.length

    return pool.legends[index < 0 ? index + pool.legends.length : index]
}

/** The distinct legends the rotation reaches over `days` days from `fromDateKey`. */
export const reachableAnswerKeys = (
    fromDateKey: string,
    days: number,
): readonly string[] => {
    const keys: string[] = []

    for (let offset = 0; offset < days; offset += 1) {
        const key = dailyAnswer(
            dailyDateKey(new Date(dayTime(fromDateKey) + offset * DAY_MS)),
        ).legend_name_key

        if (!keys.includes(key)) keys.push(key)
    }

    return keys
}

/** The roster keys no answer in `reachableKeys` covers; empty means full coverage. */
export const missingAnswerKeys = (
    rosterKeys: readonly string[],
    reachableKeys: readonly string[],
): readonly string[] => rosterKeys.filter((key) => !reachableKeys.includes(key))

/**
 * Typed names are folded to the roster's spelling: `Bödvar`, `bödvar` and
 * `  BODVAR ` all match the same legend.
 */
export const normaliseLegendName = (value: string): string =>
    value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()

export const findLegend = (value: string): Legend | null => {
    const needle = normaliseLegendName(value)

    if (needle === "") return null

    return (
        legends.find(
            (legend) =>
                normaliseLegendName(legend.bio_name) === needle ||
                normaliseLegendName(legend.legend_name_key) === needle,
        ) ?? null
    )
}

export const attributeNames = [
    "strength",
    "dexterity",
    "defense",
    "speed",
] as const
export type AttributeName = (typeof attributeNames)[number]

/** A guessed weapon sits in the answer's same slot, the other slot, or neither. */
export type WeaponMatch = "same" | "other" | "none"

/** Where the answer's attribute sits relative to the guess. */
export type AttributeHint = "higher" | "lower" | "equal"

export type GuessScore = {
    readonly legendId: number
    readonly weapons: readonly [WeaponMatch, WeaponMatch]
    readonly attributes: Readonly<Record<AttributeName, AttributeHint>>
}

/**
 * One vocabulary for the board and the share line: the board prints the label
 * beside the mark, the share line prints the mark alone.
 */
export const weaponMatchLabels: Readonly<Record<WeaponMatch, string>> = {
    same: "same slot",
    other: "other slot",
    none: "no match",
}

export const weaponMatchMarks: Readonly<Record<WeaponMatch, string>> = {
    same: "🟩",
    other: "🟨",
    none: "⬛",
}

export const attributeHintLabels: Readonly<Record<AttributeHint, string>> = {
    higher: "higher",
    lower: "lower",
    equal: "equal",
}

export const attributeHintMarks: Readonly<Record<AttributeHint, string>> = {
    higher: "⬆️",
    lower: "⬇️",
    equal: "🟰",
}

const weaponMatch = (
    weapon: string,
    sameSlot: string,
    otherSlot: string,
): WeaponMatch =>
    weapon === sameSlot ? "same" : weapon === otherSlot ? "other" : "none"

const attributeHint = (guess: number, answer: number): AttributeHint =>
    answer > guess ? "higher" : answer < guess ? "lower" : "equal"

export const scoreGuess = (guess: Legend, answer: Legend): GuessScore => {
    const guessAttributes = legendAttributes(guess)
    const answerAttributes = legendAttributes(answer)

    return {
        legendId: guess.legend_id,
        weapons: [
            weaponMatch(guess.weapon_one, answer.weapon_one, answer.weapon_two),
            weaponMatch(guess.weapon_two, answer.weapon_two, answer.weapon_one),
        ],
        attributes: {
            strength: attributeHint(
                guessAttributes.strength,
                answerAttributes.strength,
            ),
            dexterity: attributeHint(
                guessAttributes.dexterity,
                answerAttributes.dexterity,
            ),
            defense: attributeHint(
                guessAttributes.defense,
                answerAttributes.defense,
            ),
            speed: attributeHint(guessAttributes.speed, answerAttributes.speed),
        },
    }
}

export type DailyOutcome = "playing" | "won" | "lost"

export type DailyState = {
    /** The UTC day this round belongs to. */
    readonly date: string
    readonly guesses: readonly number[]
    readonly streak: number
    readonly lastWinDate: string | null
}

export const freshDailyState = (date: string): DailyState => ({
    date,
    guesses: [],
    streak: 0,
    lastWinDate: null,
})

/** A stored round from an earlier day is replaced; the streak only survives a win yesterday. */
export const resumeDailyState = (
    state: DailyState,
    date: string,
): DailyState => {
    if (state.date === date) return state

    const carried = state.lastWinDate === previousDateKey(date)

    return {
        date,
        guesses: [],
        streak: carried ? state.streak : 0,
        lastWinDate: carried ? state.lastWinDate : null,
    }
}

export const dailyOutcome = (
    state: DailyState,
    answerId: number,
): DailyOutcome =>
    state.guesses.includes(answerId)
        ? "won"
        : state.guesses.length >= MAX_DAILY_GUESSES
          ? "lost"
          : "playing"

export const dailyGuessScores = (
    state: DailyState,
    answer: Legend,
): readonly GuessScore[] =>
    state.guesses.flatMap((id) => {
        const guess = legendsMap[id]

        return guess === undefined ? [] : [scoreGuess(guess, answer)]
    })

export const recordDailyGuess = (
    state: DailyState,
    guessId: number,
    answerId: number,
): DailyState => {
    if (dailyOutcome(state, answerId) !== "playing") return state
    if (state.guesses.includes(guessId)) return state

    const guesses = [...state.guesses, guessId]

    if (guessId === answerId) {
        return {
            ...state,
            guesses,
            streak:
                state.lastWinDate === previousDateKey(state.date)
                    ? state.streak + 1
                    : 1,
            lastWinDate: state.date,
        }
    }

    return guesses.length >= MAX_DAILY_GUESSES
        ? { ...state, guesses, streak: 0, lastWinDate: null }
        : { ...state, guesses }
}

export const dailyGuessRow = (score: GuessScore): string =>
    `${score.weapons.map((match) => weaponMatchMarks[match]).join("")} ${attributeNames
        .map((name) => attributeHintMarks[score.attributes[name]])
        .join("")}`

/** Spoiler-free: only marks, the outcome and the link, never a legend name. */
export const dailyShareText = (
    state: DailyState,
    answer: Legend,
    url: string,
): string => {
    const scores = dailyGuessScores(state, answer)
    const outcome =
        dailyOutcome(state, answer.legend_id) === "won"
            ? `Solved in ${state.guesses.length}/${MAX_DAILY_GUESSES}`
            : `Lost · ${state.guesses.length}/${MAX_DAILY_GUESSES}`

    return [
        `Corehalla daily legend — ${state.date}`,
        "",
        ...scores.map(dailyGuessRow),
        "",
        outcome,
        url,
    ].join("\n")
}

const DateKey = Schema.String.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/),
    Schema.makeFilter(
        (value: string) =>
            !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) ||
            "Expected a calendar date",
    ),
)

export const dailyStateSchema = Schema.Struct({
    date: DateKey,
    guesses: Schema.Array(Schema.Int),
    streak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
    lastWinDate: Schema.NullOr(DateKey),
})

const storedDailyState = Schema.fromJsonString(dailyStateSchema)

export const encodeDailyState = (state: DailyState): string =>
    Schema.encodeSync(storedDailyState)(state)

/**
 * The stored format, decoded. Anything that is not a well-formed round on the
 * current roster — bad JSON, a broken date, an unknown legend — reads as absent
 * so the visitor starts clean instead of inheriting a corrupt board.
 */
export const decodeDailyState = (stored: string | null): DailyState | null => {
    if (stored === null) return null

    const decoded = Schema.decodeOption(storedDailyState)(stored)

    if (Option.isNone(decoded)) return null

    const state = decoded.value

    return state.guesses.every((id) => legendsMap[id] !== undefined)
        ? state
        : null
}

export const DAILY_STORAGE_KEY = "corehalla:daily"

export const loadDailyState = (
    storage: Pick<Storage, "getItem">,
    date: string,
): DailyState => {
    const stored = decodeDailyState(storage.getItem(DAILY_STORAGE_KEY))

    return stored === null
        ? freshDailyState(date)
        : resumeDailyState(stored, date)
}

export const saveDailyState = (
    storage: Pick<Storage, "setItem">,
    state: DailyState,
): void => {
    storage.setItem(DAILY_STORAGE_KEY, encodeDailyState(state))
}
