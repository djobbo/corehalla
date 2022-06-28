import { GamesDisplay } from "./GamesDisplay"

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
                        <span className="text-4xl ml-3 text-textVar1">
                            / {peak_rating}
                        </span>
                    </>
                }
                description="Peak"
            />
        </>
    )
}
