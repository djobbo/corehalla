"use client"

import { Card } from "ui/base/Card"
import { SectionTitle } from "@/components/layout/SectionTitle"
import { create } from "zustand"
import {
    getGloryFromBestRating,
    getGloryFromWins,
    getLegendEloReset,
    getPersonalEloReset,
} from "bhapi/calculator"
import { getTierFromRating } from "bhapi/helpers/getTierFromRating"

const inputClassName =
    "w-full px-4 py-2 border bg-bgVar2 border-bg rounded-lg block mb-4"
const resultClassName = "text-xl font-semibold block text-center"

type CalculatorState = {
    hasPlayed10Games: boolean
    wins: number
    rating: number
    personalRating: number
    heroRating: number
}

type CalculatorActions = {
    setHasPlayed10Games: (hasPlayed10Games: boolean) => void
    setWins: (wins: number) => void
    setRating: (rating: number) => void
    setPersonalRating: (personalRating: number) => void
    setHeroRating: (heroRating: number) => void
}

const useCalculator = create<CalculatorState & CalculatorActions>((set) => ({
    hasPlayed10Games: false,
    wins: 0,
    rating: 0,
    personalRating: 0,
    heroRating: 0,
    setHasPlayed10Games: (hasPlayed10Games) => set({ hasPlayed10Games }),
    setWins: (wins) => set({ wins }),
    setRating: (rating) => set({ rating }),
    setPersonalRating: (personalRating) => set({ personalRating }),
    setHeroRating: (heroRating) => set({ heroRating }),
}))

export default function CalculatorPage() {
    const {
        hasPlayed10Games,
        setHasPlayed10Games,
        wins,
        setWins,
        rating,
        setRating,
        personalRating,
        setPersonalRating,
        heroRating,
        setHeroRating,
    } = useCalculator()

    const gloryWins = getGloryFromWins(wins || 0)
    const gloryRating = getGloryFromBestRating(rating || 200)

    const squashPersonal = getPersonalEloReset(personalRating || 0)
    const squashHero = getLegendEloReset(heroRating || 0)

    return (
        <>
            <h1 className="text-3xl font-bold">
                New Season Glory / ELO Reset Calculator
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col gap-4 items-center">
                    <SectionTitle>Glory Calculator</SectionTitle>
                    <Card>
                        <label>
                            <input
                                className="mr-2"
                                type="checkbox"
                                checked={hasPlayed10Games}
                                onChange={(e) =>
                                    setHasPlayed10Games(e.target.checked)
                                }
                            />
                            I have played 10 ranked games (or more).
                        </label>
                    </Card>
                    {hasPlayed10Games ? (
                        <>
                            <Card title="Wins (sum up all ranked playlists)">
                                <input
                                    className={inputClassName}
                                    value={wins}
                                    onChange={(e) =>
                                        setWins(e.target.valueAsNumber)
                                    }
                                    min={0}
                                    max={10000}
                                />
                                Glory from wins:
                                <span className={resultClassName}>
                                    {gloryWins}
                                </span>
                            </Card>
                            <span className="operator">+</span>
                            <Card title="Best Rating">
                                <input
                                    className={inputClassName}
                                    value={rating}
                                    onChange={(e) =>
                                        setRating(e.target.valueAsNumber)
                                    }
                                    min={200}
                                    max={4000}
                                />
                                Glory from best rating:
                                <span className={resultClassName}>
                                    {gloryRating}
                                </span>
                            </Card>
                            <span className="operator">=</span>
                            <Card title="Total Glory">
                                <span className={resultClassName}>
                                    {gloryWins + gloryRating}
                                </span>
                            </Card>
                        </>
                    ) : (
                        <>You gotta play at least 10 ranked games!</>
                    )}
                </div>
                <div className="flex flex-col gap-4 items-center">
                    <SectionTitle>Elo Squash Calculator</SectionTitle>
                    <Card title="Personal Rating">
                        <input
                            className={inputClassName}
                            value={personalRating}
                            onChange={(e) =>
                                setPersonalRating(e.target.valueAsNumber)
                            }
                            min={200}
                            max={4000}
                        />
                        Personal Rating Squash:
                        <span className={resultClassName}>
                            {squashPersonal} (
                            {getTierFromRating(squashPersonal)})
                        </span>
                    </Card>
                    <Card title="Legend/Team Rating">
                        <input
                            className={inputClassName}
                            value={heroRating}
                            onChange={(e) =>
                                setHeroRating(e.target.valueAsNumber)
                            }
                            min={200}
                            max={4000}
                        />
                        Legend/Team Rating Squash:
                        <span className={resultClassName}>
                            {squashHero} ({getTierFromRating(squashHero)})
                        </span>
                    </Card>
                </div>
            </div>
        </>
    )
}
