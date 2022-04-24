import { Button } from "ui/base/Button"
import { FavoritesGrid } from "ui/favorites/FavoritesGrid"
import { SEO } from "../components/SEO"
import { SearchButton } from "ui/search/SearchButton"
import { SectionTitle } from "ui/layout/SectionTitle"
import { cn } from "common/helpers/classnames"
import { css } from "ui/theme"
import { useFavorites } from "db/client/AuthProvider"

const landingClassName = css({
    height: "50vh",
    minHeight: "400px",
})()

const Page = () => {
    const { favorites } = useFavorites()

    return (
        <>
            <SEO
                title="Home • Corehalla"
                description="Brawlhalla Stats, Rankings and more! Corehalla is a community of Brawlhalla players and fans. Join the community and get involved!"
            />
            <div
                className={cn(
                    "flex flex-col justify-center items-center",
                    landingClassName,
                )}
            >
                <span className="text-2xl font-bold uppercase text-accent">
                    Brawlhalla
                </span>
                <h1 className="text-5xl font-bold uppercase mt-1">
                    Stats for everyone.
                </h1>
                <p className="mt-3 max-w-lg text-center text-textVar1">
                    Welcome to Corehalla, the fastest and easiest way to find
                    your Brawlhalla Stats, and official rankings.
                </p>
                <div className="mt-8 flex items-center gap-6">
                    <SearchButton />
                    <span className="text-textVar1">or</span>
                    <Button
                        as="a"
                        href="/rankings"
                        className="whitespace-nowrap font-semibold"
                    >
                        View rankings
                    </Button>
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
