import { Progress } from "../base/Progress"
import { calculateWinrate } from "bhapi/helpers/calculateWinrate"
import { cn } from "common/helpers/classnames"
import type { ReactNode } from "react"

type GamesCardProps = {
    games: number
    wins: number
    description?: ReactNode
    className?: string
    mainContent?: ReactNode
}

export const GamesDisplay = ({
    games,
    wins,
    description,
    className,
    mainContent,
}: GamesCardProps) => {
    return (
        <div className={cn("flex flex-col", className)}>
            <p className="text-5xl font-bold">
                {mainContent ?? games}
                <span className="ml-2 text-xs font-normal uppercase text-blue11">
                    {description ?? (
                        <>
                            games ({calculateWinrate(wins, games).toFixed(2)}%
                            Winrate)
                        </>
                    )}
                </span>
            </p>
            <Progress
                value={(wins / games) * 100}
                className="h-2 rounded-full mt-2 overflow-hidden bg-danger"
                indicatorClassName="h-2 bg-success"
            />
            <div className="flex justify-between font-bold text-md mt-2">
                <span>{wins}W</span>
                <span>{games - wins}L</span>
            </div>
        </div>
    )
}
