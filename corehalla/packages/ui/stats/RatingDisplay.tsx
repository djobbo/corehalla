import { GamesDisplay } from "./GamesDisplay"
import { cn } from "common/helpers/classnames"
import { text } from "../theme"

type RatingDisplayProps = {
    className?: string
    games: number
    wins: number
    rating: number
    peak_rating: number
}

export const RatingDisplay = ({
    className,
    games,
    wins,
    rating,
    peak_rating,
}: RatingDisplayProps) => {
    return (
        <>
            <GamesDisplay
                className={className}
                games={games}
                wins={wins}
                mainContent={
                    <>
                        {rating}
                        <span className={cn("text-4xl mx-3", text("blue11"))}>
                            /
                        </span>
                        <span className="text-4xl">{peak_rating}</span>
                    </>
                }
                description="Peak"
            />
        </>
    )
}
