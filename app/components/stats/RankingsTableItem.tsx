import { Progress } from "ui/base/Progress"
import { calculateWinrate } from "bhapi/helpers/calculateWinrate"
import { cn } from "common/helpers/classnames"
import Image from "next/image"
import type { Ranking } from "bhapi/types"
import type { ReactNode } from "react"

type RankingsTableItemProps = Ranking & {
    className?: string
    index?: number
    content: ReactNode
}

export const RankingsTableItem = ({
    className,
    index = 0,
    rank,
    region,
    games,
    wins,
    rating,
    peak_rating,
    content,
    tier,
}: RankingsTableItemProps) => {
    return (
        <>
            <div
                className={cn(
                    "block md:hidden",
                    "px-4 py-2 w-full h-full items-center gap-4 hover:bg-bg",
                    {
                        "bg-bgVar2": index % 2 === 0,
                        "bg-bgVar1": index % 2 === 1,
                    },
                    className,
                )}
            >
                <div
                    className={cn("flex border-b border-textVar1 py-1", {
                        "border-bgVar1": index % 2 === 0,
                        "border-bgVar2": index % 2 === 1,
                    })}
                >
                    <span className="text-lg font-semibold text-textVar1 mr-2">
                        {rank} -
                    </span>
                    {content}
                </div>
                <div className={cn("mt-2 flex flex-col", className)}>
                    <p className="flex gap-2 items-baseline text-2xl font-bold">
                        <div className="relative w-4 h-4 rounded-md overflow-hidden">
                            <Image
                                src={`/images/icons/flags/${region}.png`}
                                alt={region}
                                layout="fill"
                                objectFit="contain"
                                objectPosition="center"
                            />
                        </div>
                        {rating}
                        <span>/</span>
                        <span className="text-textVar1 text-sm">
                            {peak_rating}
                        </span>
                        <span className="ml-2 text-xs font-normal uppercase text-textVar1">
                            peak ({tier})
                        </span>
                    </p>
                    <Progress
                        value={(wins / games) * 100}
                        className="h-1 rounded-full mt-2 overflow-hidden bg-danger"
                        indicatorClassName="h-1 bg-success"
                    />
                    <div className="flex justify-between font-bold text-sm mt-2">
                        <span>
                            {wins}W{" "}
                            <span className="text-xs text-textVar1">
                                ({calculateWinrate(wins, games).toFixed(2)}
                                %)
                            </span>
                        </span>
                        <span>
                            {games - wins}L{" "}
                            <span className="text-xs text-textVar1">
                                (
                                {calculateWinrate(games - wins, games).toFixed(
                                    2,
                                )}
                                %)
                            </span>
                        </span>
                    </div>
                </div>
            </div>
            <div
                className={cn(
                    "hidden md:flex",
                    "py-1 w-full h-full items-center gap-4 hover:bg-bg",
                    {
                        "bg-bgVar2": index % 2 === 0,
                        "bg-bgVar1": index % 2 === 1,
                    },
                    className,
                )}
            >
                <p className="w-16 h-full flex items-center justify-center text-xs">
                    {rank}
                </p>
                <p className="w-16 h-full flex items-center justify-center text-xs">
                    {region}
                </p>
                {content}
                <p className="w-16 text-center">{games}</p>
                <div className="w-32">
                    <Progress
                        value={(wins / games) * 100}
                        className="h-1 rounded-full mt-2 overflow-hidden bg-danger"
                        indicatorClassName="h-2 bg-success"
                    />
                    <div className="flex justify-between text-xs mt-2">
                        <span>{wins}W</span>
                        <span>{games - wins}L</span>
                    </div>
                </div>
                <p className="w-20 text-center">
                    {calculateWinrate(wins, games).toFixed(2)}%
                </p>
                <div className="w-40 flex items-center justify-start">
                    <p>
                        <span className="text-xl font-bold">{rating}</span>{" "}
                        <span className="text-textVar1 text-sm">
                            / {peak_rating} peak
                        </span>
                    </p>
                </div>
            </div>
        </>
    )
}
