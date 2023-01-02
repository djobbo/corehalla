import { Card } from "@ch/ui/base/Card"
import { SectionTitle } from "@components/layout/SectionTitle"
import {
    getGloryFromBestRating,
    getGloryFromWins,
    getLegendEloReset,
    getPersonalEloReset,
} from "@ch/bhapi/calculator"
import { getTierFromRating } from "@ch/bhapi/helpers/getTierFromRating"
import { useState } from "react"
import type { NextPage } from "next"

const inputClassName =
    "w-full px-4 py-2 border bg-bgVar2 border-bg rounded-lg block mb-4"
const resultClassName = "text-xl font-semibold block text-center"

const CalcPage: NextPage = () => {
    const [hasPlayed10Games, setHasPlayed10Games] = useState(false)
    const [wins, setWins] = useState("0")
    const [rating, setRating] = useState("0")
    const [personalRating, setPersonalRating] = useState("0")
    const [heroRating, setHeroRating] = useState("0")

    const gloryWins = getGloryFromWins(parseInt(wins || "0"))
    const gloryRating = getGloryFromBestRating(parseInt(rating || "200"))

    const squashPersonal = getPersonalEloReset(parseInt(personalRating || "0"))
    const squashHero = getLegendEloReset(parseInt(heroRating || "0"))

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
                                    onChange={(e) => setWins(e.target.value)}
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
                                    onChange={(e) => setRating(e.target.value)}
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
                            onChange={(e) => setPersonalRating(e.target.value)}
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
                            onChange={(e) => setHeroRating(e.target.value)}
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

export default CalcPage
