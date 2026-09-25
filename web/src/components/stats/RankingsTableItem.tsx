import { Image } from "@components/Image"
import { Progress } from "ui/base/Progress"
import { calculateWinrate } from "bhapi/helpers/calculateWinrate"
import { cn } from "common/helpers/classnames"
import type { Ranking } from "bhapi/types"
import type { ReactNode } from "react"

type RankingsTableItemProps = Ranking & {
    className?: string
    index?: number
    content: ReactNode
}

/**
 * One rankings row, shared by every table.
 *
 * A single div tree serves both breakpoints: on mobile it stacks (identity
 * line, then elo/record) and on desktop it becomes one row with the identity
 * on the left and the performance block on the right. Keeping one DOM means
 * the two views cannot drift apart.
 */
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
    const winrate = calculateWinrate(wins, games)
    const lossrate = calculateWinrate(games - wins, games)

    return (
        <div
            className={cn(
                "flex w-full flex-col px-4 py-2 hover:bg-bg",
                "md:flex-row md:items-center md:gap-6",
                {
                    "bg-bgVar2/50": index % 2 === 0,
                    "bg-bgVar1/50": index % 2 === 1,
                },
                className,
            )}
        >
            {/* Identity — the first line on mobile; on desktop the tier icon
                moves ahead of the name so it stays glued to the rank instead
                of floating next to the elo. */}
            <div
                className={cn(
                    "flex min-w-0 flex-1 items-center border-b py-1 md:border-b-0 md:py-0",
                    {
                        "border-bgVar1/50": index % 2 === 0,
                        "border-bgVar2/50": index % 2 === 1,
                    },
                )}
            >
                <span className="mr-2 text-lg font-semibold text-textVar1">
                    {rank} -
                </span>
                <div className="order-2 flex min-w-0 flex-1 items-center md:order-3">
                    {content}
                </div>
                <Image
                    src={`/images/icons/ranked/${tier}${
                        tier === "Valhallan" ? ".webp" : ".png"
                    }`}
                    alt={region}
                    containerClassName="order-3 w-6 h-6 md:order-2 md:w-8 md:h-8 md:mr-3 shrink-0 rounded-md overflow-hidden"
                    className="object-contain object-center"
                />
            </div>
            {/* Performance — under the identity on mobile, beside it on
                desktop, right-aligned so elo and the winrate bar line up
                across rows. */}
            <div className="mt-2 flex flex-col md:mt-0 md:flex-row md:items-center md:gap-6">
                <p className="flex items-baseline gap-2 text-2xl font-bold">
                    <Image
                        src={`/images/icons/flags/${region}.png`}
                        alt={region}
                        containerClassName="w-4 h-4 rounded-sm overflow-hidden"
                        className="object-contain object-center"
                    />
                    {rating}
                    <span>/</span>
                    <span className="text-textVar1 text-sm">{peak_rating}</span>
                    <span className="ml-2 text-xs font-normal uppercase text-textVar1 md:hidden">
                        peak ({tier})
                    </span>
                </p>
                <div className="md:w-40 lg:w-64">
                    <Progress
                        value={(wins / games) * 100}
                        className="mt-2 h-1 rounded-full overflow-hidden bg-danger md:mt-0"
                        indicatorClassName="h-1 bg-success"
                    />
                    <div className="mt-2 flex justify-between text-sm font-bold">
                        <span>
                            {wins}W{" "}
                            <span className="text-xs text-textVar1">
                                ({winrate.toFixed(2)}%)
                            </span>
                        </span>
                        <span>
                            {games - wins}L{" "}
                            <span className="text-xs text-textVar1">
                                ({lossrate.toFixed(2)}%)
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
