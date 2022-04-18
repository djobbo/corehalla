import { FavoritesGrid } from "ui/favorites/FavoritesGrid"
import { SectionTitle } from "ui/layout/SectionTitle"
import { cn } from "common/helpers/classnames"
import { css, text } from "ui/theme"
import { useFavorites } from "common/features/favorites/favoritesProvider"

const landingClassName = css({
    height: "60vh",
})()

const Page = () => {
    const { favorites } = useFavorites()

    return (
        <>
            <div
                className={cn(
                    "flex flex-col justify-center items-center",
                    landingClassName,
                )}
            >
                <span
                    className={cn(
                        "text-2xl font-bold uppercase",
                        text("blue9"),
                    )}
                >
                    Brawlhalla
                </span>
                <h1 className="text-5xl font-bold uppercase">
                    Stats for everyone.
                </h1>
                <p className="mt-4 max-w-lg text-center">
                    Welcome to Corehalla, the fastest and easiest way to find
                    your Brawlhalla Stats, and official rankings.
                </p>
            </div>
            {favorites.length > 0 && (
                <div>
                    <SectionTitle>Favorites</SectionTitle>
                    <FavoritesGrid favorites={favorites} />
                </div>
            )}
        </>
    )
}

export default Page
