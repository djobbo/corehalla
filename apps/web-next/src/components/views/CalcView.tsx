import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { eloSquash, gloryBreakdown, parseNumericInput } from "@/lib/calc"
import { cn } from "@/lib/cn"
import { tierColor } from "@/lib/rankings"
import { useId } from "react"
import type { CSSProperties } from "react"

export type CalcViewProps = {
    readonly hasTenGames: boolean
    readonly wins: string
    readonly bestRating: string
    readonly personalRating: string
    readonly legendRating: string
    readonly onHasTenGamesChange: (value: boolean) => void
    readonly onWinsChange: (value: string) => void
    readonly onBestRatingChange: (value: string) => void
    readonly onPersonalRatingChange: (value: string) => void
    readonly onLegendRatingChange: (value: string) => void
}

const RatingField = ({
    label,
    value,
    onChange,
}: {
    readonly label: string
    readonly value: string
    readonly onChange: (value: string) => void
}) => {
    const id = useId()

    return (
        <div className="flex min-w-0 flex-col gap-1">
            <label htmlFor={id} className="ch-stat-label">
                {label}
            </label>
            <Input
                id={id}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    )
}

const Stat = ({
    label,
    value,
}: {
    readonly label: string
    readonly value: number
}) => (
    <div className="flex flex-col gap-0.5">
        <span className="ch-stat-label">{label}</span>
        <span className="ch-stat-value">{value}</span>
    </div>
)

const TierChip = ({ tier }: { readonly tier: string }) => (
    <span
        className="ch-tier"
        style={{ "--ch-tier": tierColor(tier) } as CSSProperties}
    >
        {tier}
    </span>
)

const SquashResult = ({
    label,
    rating,
    tier,
}: {
    readonly label: string
    readonly rating: number
    readonly tier: string
}) => (
    <div className="flex items-center justify-between gap-2 bg-bgVar2 px-2.5 py-2">
        <span className="ch-stat-label">{label}</span>
        <span className="flex items-center gap-2">
            <span className="ch-stat-value">{rating}</span>
            <TierChip tier={tier} />
        </span>
    </div>
)

export const CalcView = ({
    hasTenGames,
    wins,
    bestRating,
    personalRating,
    legendRating,
    onHasTenGamesChange,
    onWinsChange,
    onBestRatingChange,
    onPersonalRatingChange,
    onLegendRatingChange,
}: CalcViewProps) => {
    const glory = gloryBreakdown({
        hasTenGames,
        wins: parseNumericInput(wins),
        bestRating: parseNumericInput(bestRating),
    })
    const squash = eloSquash({
        personalRating: parseNumericInput(personalRating),
        legendRating: parseNumericInput(legendRating),
    })

    return (
        <main id="main" tabIndex={-1} className="ch-page">
            <header className="ch-hero mb-3">
                <p className="ch-kicker">Tools</p>
                <h1 className="ch-display mt-1 text-2xl md:text-3xl">
                    Glory / ELO reset calculator
                </h1>
                <p className="mt-2 max-w-2xl text-xs text-muted-foreground">
                    Work out the glory your ranked season earned, and the rating
                    the next season starts you at. Nothing leaves this page —
                    every number is computed from what you type.
                </p>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Glory</CardTitle>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            End-of-season glory from your ranked wins and your
                            best rating. Sum your wins across every ranked
                            playlist.
                        </p>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={hasTenGames}
                            onClick={() => onHasTenGamesChange(!hasTenGames)}
                            className={cn(
                                "ch-chip self-start",
                                hasTenGames ? "ch-chip-on" : "ch-chip-off",
                            )}
                        >
                            I have played 10 or more ranked games
                        </button>

                        {glory.enough ? (
                            <>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <RatingField
                                        label="Ranked wins"
                                        value={wins}
                                        onChange={onWinsChange}
                                    />
                                    <RatingField
                                        label="Best rating"
                                        value={bestRating}
                                        onChange={onBestRatingChange}
                                    />
                                </div>
                                <div className="grid gap-3 border-t border-border/40 pt-4 sm:grid-cols-3">
                                    <Stat
                                        label="From wins"
                                        value={glory.fromWins}
                                    />
                                    <Stat
                                        label="From best rating"
                                        value={glory.fromBestRating}
                                    />
                                    <Stat
                                        label="Total glory"
                                        value={glory.total}
                                    />
                                </div>
                            </>
                        ) : (
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Glory is awarded after 10 ranked games. Play at
                                least 10 this season and come back with your
                                wins and best rating.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Elo squash</CardTitle>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            The rating you keep when the next season resets it,
                            for your own rank and for a legend or team rank.
                        </p>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex flex-col gap-2">
                            <RatingField
                                label="Personal rating"
                                value={personalRating}
                                onChange={onPersonalRatingChange}
                            />
                            <SquashResult
                                label="Personal reset"
                                rating={squash.personal.rating}
                                tier={squash.personal.tier}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <RatingField
                                label="Legend or team rating"
                                value={legendRating}
                                onChange={onLegendRatingChange}
                            />
                            <SquashResult
                                label="Legend or team reset"
                                rating={squash.legend.rating}
                                tier={squash.legend.tier}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
