import { FavoritesGrid } from "ui/favorites/FavoritesGrid"
import { SectionTitle } from "ui/layout/SectionTitle"
import { bg, css, text } from "ui/theme"
import { cn } from "common/helpers/classnames"
import { useFavorites } from "common/features/favorites/favoritesProvider"
import { useKBar } from "kbar"

const landingClassName = css({
    height: "60vh",
})()

const Page = () => {
    const { favorites } = useFavorites()
    const { query } = useKBar()

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
                <div className="mt-8">
                    <button
                        type="button"
                        className={cn("rounded py-2 px-4", bg("blue9"))}
                        onClick={query.toggle}
                    >
                        Search player...
                    </button>
                </div>
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
