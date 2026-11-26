import { describe, expect, it } from "@effect/vitest"
import { legends, legendsMap } from "@crh/bhapi/legends"
import {
    DAILY_STORAGE_KEY,
    MAX_DAILY_GUESSES,
    dailyAnswer,
    dailyAnswerPools,
    dailyDateKey,
    dailyGuessRow,
    dailyGuessScores,
    dailyOutcome,
    dailyRosterCutover,
    dailyShareText,
    decodeDailyState,
    encodeDailyState,
    findLegend,
    freshDailyState,
    loadDailyState,
    missingAnswerKeys,
    normaliseLegendName,
    reachableAnswerKeys,
    recordDailyGuess,
    resumeDailyState,
    saveDailyState,
    scoreGuess,
    type DailyState,
} from "./dailyPuzzle"

const legend = (key: string) => {
    const found = legends.find((entry) => entry.legend_name_key === key)

    if (found === undefined) throw new Error(`Missing legend ${key}`)

    return found
}

const TODAY = "2026-11-26"

const DAY_MS = 86_400_000

const addDays = (dateKey: string, days: number): string =>
    new Date(Date.parse(`${dateKey}T00:00:00.000Z`) + days * DAY_MS)
        .toISOString()
        .slice(0, 10)

const daysBetween = (from: string, to: string): number =>
    Math.round(
        (Date.parse(`${to}T00:00:00.000Z`) -
            Date.parse(`${from}T00:00:00.000Z`)) /
            DAY_MS,
    )

const play = (state: DailyState, keys: readonly string[], answerId: number) =>
    keys.reduce(
        (next, key) => recordDailyGuess(next, legend(key).legend_id, answerId),
        state,
    )

const memoryStorage = (initial: Record<string, string> = {}) => {
    const values = new Map(Object.entries(initial))

    return {
        values,
        getItem: (key: string) => values.get(key) ?? null,
        setItem(key: string, value: string) {
            values.set(key, value)
        },
    }
}

describe("dailyAnswer", () => {
    it("pins a legend to a date", () => {
        expect(dailyAnswer("2026-01-01").legend_name_key).toBe("bodvar")
        expect(dailyAnswer("2026-01-02").legend_name_key).toBe("mordex")
        expect(dailyAnswer("2026-01-03").legend_name_key).toBe("queen nai")
    })

    it("pins a date later in the rotation", () => {
        expect(dailyAnswer("2026-11-26").legend_name_key).toBe("jiro")
    })

    it("wraps after the last answer instead of running past it", () => {
        expect(dailyAnswer("2026-02-10").legend_name_key).toBe("bodvar")
    })

    it("answers with a legend the roster still ships", () => {
        for (const key of dailyAnswerPools.flatMap((pool) => pool.keys)) {
            expect(legendsMap[legend(key).legend_id]).toBeDefined()
        }
    })
})

describe("answer rotation", () => {
    const [legacyPool, rosterPool] = dailyAnswerPools

    it("answers every date before the cutover from the untouched 40-key pool", () => {
        expect(legacyPool.keys).toHaveLength(40)

        const days = daysBetween(legacyPool.from, dailyRosterCutover)

        for (let offset = 0; offset < days; offset += 1) {
            expect(
                dailyAnswer(addDays(legacyPool.from, offset)).legend_name_key,
            ).toBe(legacyPool.keys[offset % legacyPool.keys.length])
        }
    })

    it("keeps today's answer while the cutover is still ahead", () => {
        expect(TODAY < dailyRosterCutover).toBe(true)
        expect(dailyAnswer(TODAY).legend_name_key).toBe("jiro")
    })

    it("switches to the roster pool on the cutover date", () => {
        expect(rosterPool.from).toBe(dailyRosterCutover)
        expect(dailyAnswer(dailyRosterCutover).legend_name_key).toBe(
            rosterPool.keys[0],
        )
    })

    it("reaches every legend in the roster after the cutover", () => {
        const reachable = reachableAnswerKeys(
            dailyRosterCutover,
            legends.length,
        )
        const missing = missingAnswerKeys(
            legends.map((entry) => entry.legend_name_key),
            reachable,
        )

        expect(
            missing,
            `Legends with no date in the rotation: ${missing.join(", ")}`,
        ).toEqual([])
    })

    it("answers with legends the 40-key pool never used", () => {
        const legacyKeys = new Set(legacyPool.keys)
        const fresh = reachableAnswerKeys(
            dailyRosterCutover,
            legends.length,
        ).filter((key) => !legacyKeys.has(key))

        expect(fresh.length).toBeGreaterThan(0)
    })

    it("names the roster keys a rotation cannot reach", () => {
        expect(missingAnswerKeys(["bodvar", "mordex"], ["bodvar"])).toEqual([
            "mordex",
        ])
        expect(missingAnswerKeys(["bodvar"], ["bodvar"])).toEqual([])
    })
})

describe("dailyDateKey", () => {
    it("reads the moment in UTC, not the machine's zone", () => {
        expect(dailyDateKey(new Date("2026-11-26T23:30:00.000-05:00"))).toBe(
            "2026-11-27",
        )
        expect(dailyDateKey(new Date("2026-11-26T00:30:00.000+05:00"))).toBe(
            "2026-11-25",
        )
    })
})

describe("legend name matching", () => {
    it("folds case, whitespace and diacritics to one spelling", () => {
        expect(normaliseLegendName("  Lord   Vraxx ")).toBe("lord vraxx")
        expect(normaliseLegendName("BÖDVAR")).toBe("bodvar")
    })

    it("matches a typed name against both spellings on the roster", () => {
        expect(findLegend("  lord   vraxx ")?.legend_id).toBe(6)
        expect(findLegend("bodvar")?.legend_id).toBe(3)
        expect(findLegend("Bödvar")?.legend_id).toBe(3)
    })

    it("returns null for an empty or unknown name", () => {
        expect(findLegend("   ")).toBeNull()
        expect(findLegend("no such legend")).toBeNull()
    })
})

describe("scoreGuess", () => {
    it("scores each weapon against the answer's slot", () => {
        const answer = legend("mirage")

        expect(scoreGuess(legend("queen nai"), answer).weapons).toEqual([
            "other",
            "none",
        ])
        expect(scoreGuess(legend("mordex"), answer).weapons).toEqual([
            "same",
            "none",
        ])
        expect(scoreGuess(legend("koji"), answer).weapons).toEqual([
            "none",
            "none",
        ])
    })

    it("scores the answer's attributes relative to the guess", () => {
        const score = scoreGuess(legend("cassidy"), legend("bodvar"))

        expect(score.attributes).toEqual({
            strength: "equal",
            dexterity: "lower",
            defense: "higher",
            speed: "higher",
        })
    })

    it("marks the answer itself as a full match", () => {
        const score = scoreGuess(legend("mordex"), legend("mordex"))

        expect(score.weapons).toEqual(["same", "same"])
        expect(score.attributes).toEqual({
            strength: "equal",
            dexterity: "equal",
            defense: "equal",
            speed: "equal",
        })
    })
})

describe("round outcome", () => {
    const answer = legend("mordex")

    it("is playing before any guess and after a miss", () => {
        expect(dailyOutcome(freshDailyState(TODAY), answer.legend_id)).toBe(
            "playing",
        )

        const missed = play(
            freshDailyState(TODAY),
            ["bodvar"],
            answer.legend_id,
        )

        expect(dailyOutcome(missed, answer.legend_id)).toBe("playing")
    })

    it("is won once the answer is guessed", () => {
        const won = play(
            freshDailyState(TODAY),
            ["bodvar", "mordex"],
            answer.legend_id,
        )

        expect(dailyOutcome(won, answer.legend_id)).toBe("won")
        expect(dailyGuessScores(won, answer)).toHaveLength(2)
    })

    it("is lost after the sixth miss", () => {
        const misses = legends
            .filter((entry) => entry.legend_id !== answer.legend_id)
            .slice(0, MAX_DAILY_GUESSES)
            .map((entry) => entry.legend_name_key)
        const lost = play(freshDailyState(TODAY), misses, answer.legend_id)

        expect(lost.guesses).toHaveLength(MAX_DAILY_GUESSES)
        expect(dailyOutcome(lost, answer.legend_id)).toBe("lost")
    })

    it("ignores a guess once the round is over", () => {
        const won = play(freshDailyState(TODAY), ["mordex"], answer.legend_id)

        expect(
            recordDailyGuess(won, legend("bodvar").legend_id, answer.legend_id),
        ).toBe(won)
    })

    it("ignores a legend that was already guessed", () => {
        const once = play(freshDailyState(TODAY), ["bodvar"], answer.legend_id)
        const twice = recordDailyGuess(
            once,
            legend("bodvar").legend_id,
            answer.legend_id,
        )

        expect(twice).toBe(once)
        expect(twice.guesses).toEqual([3])
    })
})

describe("streak", () => {
    const answer = legend("mordex").legend_id

    it("starts at one on a first win", () => {
        const won = recordDailyGuess(
            freshDailyState("2026-11-20"),
            answer,
            answer,
        )

        expect(won.streak).toBe(1)
        expect(won.lastWinDate).toBe("2026-11-20")
    })

    it("does not advance on a same-day replay", () => {
        const won = recordDailyGuess(
            freshDailyState("2026-11-20"),
            answer,
            answer,
        )

        expect(recordDailyGuess(won, answer, answer)).toBe(won)
        expect(won.streak).toBe(1)
    })

    it("carries over to the next day and advances on a win", () => {
        const won = recordDailyGuess(
            freshDailyState("2026-11-20"),
            answer,
            answer,
        )
        const next = resumeDailyState(won, "2026-11-21")

        expect(next.guesses).toEqual([])
        expect(next.streak).toBe(1)

        const wonAgain = recordDailyGuess(next, answer, answer)

        expect(wonAgain.streak).toBe(2)
        expect(wonAgain.lastWinDate).toBe("2026-11-21")
    })

    it("resets after a skipped day", () => {
        const won = recordDailyGuess(
            freshDailyState("2026-11-20"),
            answer,
            answer,
        )
        const skipped = resumeDailyState(won, "2026-11-22")

        expect(skipped.streak).toBe(0)
        expect(skipped.lastWinDate).toBeNull()

        expect(recordDailyGuess(skipped, answer, answer).streak).toBe(1)
    })

    it("resets on a loss", () => {
        const won = recordDailyGuess(
            freshDailyState("2026-11-20"),
            answer,
            answer,
        )
        const next = resumeDailyState(won, "2026-11-21")
        const misses = legends
            .filter((entry) => entry.legend_id !== answer)
            .slice(0, MAX_DAILY_GUESSES)
            .map((entry) => entry.legend_name_key)
        const lost = play(next, misses, answer)

        expect(lost.streak).toBe(0)
        expect(lost.lastWinDate).toBeNull()
    })
})

describe("resumeDailyState", () => {
    it("keeps the guesses of the same day", () => {
        const state = play(freshDailyState(TODAY), ["bodvar"], 35)

        expect(resumeDailyState(state, TODAY)).toBe(state)
    })

    it("starts a fresh round on a new day", () => {
        const state = play(freshDailyState(TODAY), ["bodvar"], 35)
        const next = resumeDailyState(state, "2026-11-27")

        expect(next.date).toBe("2026-11-27")
        expect(next.guesses).toEqual([])
    })
})

describe("dailyShareText", () => {
    const answer = legend("mordex")
    const url = "https://corehalla.com/daily"

    it("writes one row per guess plus the outcome and the link", () => {
        const state = play(
            freshDailyState(TODAY),
            ["bodvar", "cassidy", "mordex"],
            answer.legend_id,
        )
        const text = dailyShareText(state, answer, url)
        const rows = text.split("\n").filter((line) => /[🟩🟨⬛]/u.test(line))

        expect(rows).toHaveLength(3)
        expect(text).toContain(`Solved in 3/${MAX_DAILY_GUESSES}`)
        expect(text).toContain(url)
        expect(text).toContain(TODAY)
    })

    it("reports a loss after the sixth guess", () => {
        const misses = legends
            .filter((entry) => entry.legend_id !== answer.legend_id)
            .slice(0, MAX_DAILY_GUESSES)
            .map((entry) => entry.legend_name_key)
        const lost = play(freshDailyState(TODAY), misses, answer.legend_id)

        expect(dailyShareText(lost, answer, url)).toContain(
            `Lost · ${MAX_DAILY_GUESSES}/${MAX_DAILY_GUESSES}`,
        )
    })

    it("never names the answer", () => {
        const state = play(
            freshDailyState(TODAY),
            ["bodvar", "cassidy", "mordex"],
            answer.legend_id,
        )
        const text = dailyShareText(state, answer, url)

        expect(text).not.toContain(answer.bio_name)
        expect(text).not.toContain(answer.legend_name_key)
    })

    it("uses the same marks as the board row", () => {
        const state = play(freshDailyState(TODAY), ["bodvar"], answer.legend_id)
        const [score] = dailyGuessScores(state, answer)

        expect(dailyShareText(state, answer, url)).toContain(
            dailyGuessRow(score),
        )
    })
})

describe("storage", () => {
    const answer = legend("mordex").legend_id
    const state = play(
        freshDailyState(TODAY),
        ["bodvar", "cassidy", "mordex"],
        answer,
    )

    it("round-trips a round through the stored format", () => {
        expect(decodeDailyState(encodeDailyState(state))).toEqual(state)
    })

    it("starts clean on malformed storage", () => {
        expect(decodeDailyState(null)).toBeNull()
        expect(decodeDailyState("not json")).toBeNull()
        expect(decodeDailyState('{"date":"2026-99-99"}')).toBeNull()
        expect(
            decodeDailyState(
                '{"date":"2026-11-26","guesses":[99999],"streak":0,"lastWinDate":null}',
            ),
        ).toBeNull()
    })

    it("loads a stored round and resumes it for today", () => {
        const storage = memoryStorage({
            [DAILY_STORAGE_KEY]: encodeDailyState({
                ...state,
                date: "2026-11-25",
            }),
        })
        const loaded = loadDailyState(storage, TODAY)

        expect(loaded.date).toBe(TODAY)
        expect(loaded.guesses).toEqual([])
    })

    it("loads a fresh round when the browser holds nothing usable", () => {
        expect(loadDailyState(memoryStorage(), TODAY)).toEqual(
            freshDailyState(TODAY),
        )
        expect(
            loadDailyState(
                memoryStorage({ [DAILY_STORAGE_KEY]: "{oops" }),
                TODAY,
            ),
        ).toEqual(freshDailyState(TODAY))
    })

    it("writes the round under the puzzle's key", () => {
        const storage = memoryStorage()

        saveDailyState(storage, state)

        expect(decodeDailyState(storage.getItem(DAILY_STORAGE_KEY))).toEqual(
            state,
        )
    })
})
