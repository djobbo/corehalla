import { legends, legendsMap } from "@crh/bhapi/legends"
import type { Legend } from "@crh/bhapi/types"
import { Link } from "@tanstack/react-router"
import { Check, Copy } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import type { FormEvent } from "react"
import { LegendIcon } from "@/components/legend/LegendIcon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { legendHref } from "@/lib/legends"
import {
    MAX_DAILY_GUESSES,
    attributeHintLabels,
    attributeHintMarks,
    attributeNames,
    dailyGuessScores,
    dailyOutcome,
    dailyShareText,
    findLegend,
    weaponMatchLabels,
    weaponMatchMarks,
    type DailyState,
    type GuessScore,
} from "@/lib/dailyPuzzle"

export type DailyPuzzleProps = {
    readonly state: DailyState
    readonly answer: Legend
    readonly shareUrl: string
    readonly onGuess: (legendId: number) => void
}

type CopyState = "idle" | "copied" | "failed"

const CONFIRMATION_MS = 2400

const attributeLabel = (name: (typeof attributeNames)[number]): string =>
    name.charAt(0).toUpperCase() + name.slice(1)

const legendAttributeValue = (
    legend: Legend,
    name: (typeof attributeNames)[number],
): number => Number(legend[name])

const ScoreCell = ({
    value,
    mark,
    label,
}: {
    readonly value: string
    readonly mark: string
    readonly label: string
}) => (
    <div className="flex min-w-0 flex-col">
        <span className="truncate text-xs font-semibold">{value}</span>
        <span className="text-[0.62rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
            <span aria-hidden>{mark}</span> {label}
        </span>
    </div>
)

const GuessRow = ({
    guess,
    score,
}: {
    readonly guess: Legend
    readonly score: GuessScore
}) => (
    <li className="flex flex-col gap-2 bg-card p-2 shadow-sm sm:flex-row sm:items-center">
        <Link
            to={legendHref(guess)}
            className="flex w-full shrink-0 items-center gap-1.5 sm:w-40"
        >
            <LegendIcon
                legend={guess}
                className="size-7 shrink-0 object-contain"
            />
            <span className="truncate text-sm font-semibold">
                {guess.bio_name}
            </span>
        </Link>
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-x-3 gap-y-2 lg:grid-cols-6">
            <ScoreCell
                value={guess.weapon_one}
                mark={weaponMatchMarks[score.weapons[0]]}
                label={weaponMatchLabels[score.weapons[0]]}
            />
            <ScoreCell
                value={guess.weapon_two}
                mark={weaponMatchMarks[score.weapons[1]]}
                label={weaponMatchLabels[score.weapons[1]]}
            />
            {attributeNames.map((name) => (
                <ScoreCell
                    key={name}
                    value={`${attributeLabel(name)} ${legendAttributeValue(guess, name)}`}
                    mark={attributeHintMarks[score.attributes[name]]}
                    label={attributeHintLabels[score.attributes[name]]}
                />
            ))}
        </div>
    </li>
)

const describeScore = (guess: Legend, score: GuessScore): string => {
    const weapons = [
        `${guess.weapon_one} ${weaponMatchLabels[score.weapons[0]]}`,
        `${guess.weapon_two} ${weaponMatchLabels[score.weapons[1]]}`,
    ]
    const attributes = attributeNames.map(
        (name) => `${name} ${attributeHintLabels[score.attributes[name]]}`,
    )

    return `${guess.bio_name}: ${weapons.join(", ")}. ${attributes.join(", ")}.`
}

export const DailyPuzzle = ({
    state,
    answer,
    shareUrl,
    onGuess,
}: DailyPuzzleProps) => {
    const inputId = useId()
    const listId = useId()
    const errorId = useId()

    const [value, setValue] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [copyState, setCopyState] = useState<CopyState>("idle")

    const outcome = dailyOutcome(state, answer.legend_id)
    const resultHeading = useRef<HTMLParagraphElement>(null)
    const wasPlaying = useRef(outcome === "playing")

    useEffect(() => {
        if (copyState === "idle") return

        const timer = setTimeout(() => setCopyState("idle"), CONFIRMATION_MS)

        return () => clearTimeout(timer)
    }, [copyState])

    useEffect(() => {
        const playing = outcome === "playing"

        // The guess form unmounts when the round ends, so the keyboard follows the result.
        if (wasPlaying.current && !playing) resultHeading.current?.focus()

        wasPlaying.current = playing
    }, [outcome])

    const scores = dailyGuessScores(state, answer)
    const latest = scores.at(-1)
    const latestGuess =
        latest === undefined ? undefined : legendsMap[latest.legendId]
    const remaining = MAX_DAILY_GUESSES - state.guesses.length
    const suggestions = legends.filter(
        (legend) => !state.guesses.includes(legend.legend_id),
    )

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const legend = findLegend(value)

        if (legend === null) {
            setError(
                `No legend called “${value.trim()}”. Pick one from the list.`,
            )

            return
        }

        if (state.guesses.includes(legend.legend_id)) {
            setError(`${legend.bio_name} is already on the board.`)

            return
        }

        setError(null)
        setValue("")
        onGuess(legend.legend_id)
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(
                dailyShareText(state, answer, shareUrl),
            )
            setCopyState("copied")
        } catch {
            setCopyState("failed")
        }
    }

    const announcement =
        copyState === "copied"
            ? "Result copied to the clipboard."
            : copyState === "failed"
              ? "Could not copy the result."
              : outcome === "won"
                ? `Correct — ${answer.bio_name}, in ${state.guesses.length} ${state.guesses.length === 1 ? "guess" : "guesses"}.`
                : outcome === "lost"
                  ? `Out of guesses. The answer was ${answer.bio_name}.`
                  : latest === undefined || latestGuess === undefined
                    ? ""
                    : describeScore(latestGuess, latest)

    return (
        <main id="main" tabIndex={-1} className="ch-page">
            <header className="ch-hero mb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="ch-kicker">Play</p>
                        <h1 className="ch-display mt-1 text-2xl md:text-3xl">
                            Daily legend
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex flex-col text-right">
                            <span className="ch-stat-label">Streak</span>
                            <span className="ch-stat-value">
                                {state.streak}
                            </span>
                        </span>
                        <span className="flex flex-col text-right">
                            <span className="ch-stat-label">Guesses</span>
                            <span className="ch-stat-value">
                                {state.guesses.length}/{MAX_DAILY_GUESSES}
                            </span>
                        </span>
                    </div>
                </div>
                <p className="mt-2 max-w-2xl text-xs text-muted-foreground">
                    One legend is the answer for today. Each guess scores both
                    weapons against the answer's slots and says whether the
                    answer's strength, dexterity, defense and speed are higher,
                    lower or equal.
                </p>
            </header>

            <output aria-live="polite" className="sr-only">
                {announcement}
            </output>

            {outcome === "playing" ? (
                <form
                    onSubmit={submit}
                    className="flex flex-col gap-2 bg-card p-3 shadow-md"
                >
                    <div className="flex flex-col gap-1">
                        <label htmlFor={inputId} className="ch-stat-label">
                            Your guess
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                id={inputId}
                                list={listId}
                                value={value}
                                onChange={(event) => {
                                    setValue(event.target.value)
                                    setError(null)
                                }}
                                autoComplete="off"
                                spellCheck={false}
                                aria-invalid={error !== null}
                                aria-describedby={
                                    error === null ? undefined : errorId
                                }
                                placeholder="Start typing a legend…"
                                className="min-w-0 flex-1"
                            />
                            <Button
                                type="submit"
                                disabled={value.trim() === ""}
                            >
                                Guess
                            </Button>
                        </div>
                        <datalist id={listId}>
                            {suggestions.map((legend) => (
                                <option
                                    key={legend.legend_id}
                                    value={legend.bio_name}
                                >
                                    {legend.bio_name}
                                </option>
                            ))}
                        </datalist>
                        {error !== null && (
                            <p id={errorId} className="text-xs text-danger">
                                {error}
                            </p>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {remaining === 1
                            ? "One guess left."
                            : `${remaining} guesses left.`}
                    </p>
                </form>
            ) : (
                <section
                    aria-labelledby="daily-result"
                    className="flex flex-col gap-3 bg-card p-3 shadow-md"
                >
                    <div>
                        <p
                            id="daily-result"
                            ref={resultHeading}
                            tabIndex={-1}
                            className="ch-kicker"
                        >
                            {outcome === "won" ? "Solved" : "Out of guesses"}
                        </p>
                        <Link
                            to={legendHref(answer)}
                            className="mt-1 flex w-fit items-center gap-2"
                        >
                            <LegendIcon
                                legend={answer}
                                className="size-9 shrink-0 object-contain"
                            />
                            <span className="ch-display text-xl">
                                {answer.bio_name}
                            </span>
                        </Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => void copy()}
                        >
                            {copyState === "copied" ? (
                                <Check aria-hidden />
                            ) : (
                                <Copy aria-hidden />
                            )}
                            {copyState === "copied"
                                ? "Result copied"
                                : copyState === "failed"
                                  ? "Copy failed"
                                  : "Copy result"}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            A new legend arrives after midnight UTC.
                        </span>
                    </div>
                    <pre className="overflow-x-auto bg-bgVar2 p-2 text-xs whitespace-pre-wrap">
                        {dailyShareText(state, answer, shareUrl)}
                    </pre>
                </section>
            )}

            <section aria-label="Your guesses" className="mt-4">
                <h2 className="ch-display mb-1.5 text-sm">Your guesses</h2>
                {scores.length === 0 ? (
                    <p className="bg-bgVar2 p-3 text-xs text-muted-foreground">
                        No guesses yet. The board fills in as you play.
                    </p>
                ) : (
                    <ul className="flex list-none flex-col gap-1.5">
                        {scores.map((score) => {
                            const guess = legendsMap[score.legendId]

                            return guess === undefined ? null : (
                                <GuessRow
                                    key={score.legendId}
                                    guess={guess}
                                    score={score}
                                />
                            )
                        })}
                    </ul>
                )}
            </section>
        </main>
    )
}
