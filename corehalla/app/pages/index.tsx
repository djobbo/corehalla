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
                <span className="text-2xl font-bold uppercase text-blue9">
                    Brawlhalla
                </span>
                <h1 className="text-5xl font-bold uppercase">
                    Stats for everyone.
                </h1>
                <p className="mt-4 max-w-lg text-center">
                    Welcome to Corehalla, the fastest and easiest way to find
                    your Brawlhalla Stats, and official rankings.
                </p>
                <div className="mt-8 flex items-center gap-6">
                    <SearchButton />
                    or
                    <Button
                        large
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
