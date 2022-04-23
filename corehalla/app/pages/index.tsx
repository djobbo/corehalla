import { Button } from "ui/base/Button"
import { FavoritesGrid } from "ui/favorites/FavoritesGrid"
import { SearchButton } from "ui/search/SearchButton"
import { SectionTitle } from "ui/layout/SectionTitle"
import { cn } from "common/helpers/classnames"
import { css, text } from "ui/theme"
import { useFavorites } from "db/client/AuthProvider"
import Head from "next/head"

const landingClassName = css({
    height: "50vh",
    minHeight: "400px",
})()

const Page = () => {
    const { favorites } = useFavorites()

    return (
        <>
            <Head>
                <title>Home • Corehalla</title>
            </Head>
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
