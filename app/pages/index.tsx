import { ArticlePreviewGrid } from "@components/articles/ArticlePreviewGrid"
import { Button } from "ui/base/Button"
import { DiscordIcon } from "ui/icons"
import { FavoritesGrid } from "@components/favorites/FavoritesGrid"
import { SEO } from "@components/SEO"
import { SearchButton } from "@components/search/SearchButton"
import { SectionTitle } from "@components/layout/SectionTitle"
import { WeeklyRotation } from "@components/WeeklyRotation"
import { cn } from "common/helpers/classnames"
import { css } from "ui/theme"
import { useAuth, useFavorites } from "@ctx/auth/AuthProvider"
import { useBrawlhallaArticles } from "@hooks/useBrawlhallaArticles"
import { useWeeklyRotation } from "@hooks/useWeeklyRotation"

const landingClassName = css({
    height: "60vh",
    minHeight: "400px",
})()

const Page = () => {
    const { isLoggedIn, signIn } = useAuth()
    const { favorites } = useFavorites()
    const { articles } = useBrawlhallaArticles(1, "", 3)
    const { weeklyRotation } = useWeeklyRotation()

    return (
        <>
            <SEO
                title="Track your Brawlhalla stats, view rankings, and more! • Corehalla"
                description="Track your stats now! View official rankings, and navigate
                through a database of millions of Brawlhalla players and
                clans."
            />
            <div
                className={cn(
                    "flex flex-col justify-center items-center",
                    landingClassName,
                )}
            >
                <span className="text-center text-lg sm:text-2xl font-bold uppercase bg-gradient-to-l from-accent to-accentVar1 bg-clip-text text-fill-none">
                    Welcome to
                </span>
                <h1 className="text-center text-3xl sm:text-5xl font-bold uppercase mt-1">
                    Corehalla
                </h1>
                <p className="text-sm sm:text-base mt-3 max-w-lg text-center text-textVar1">
                    Track your stats now! View official rankings, and navigate
                    through a database of millions of Brawlhalla players and
                    clans.
                </p>
                <div className="mt-8 flex items-center gap-3 sm:gap-6 flex-col sm:flex-row">
                    <SearchButton />
                    <span className="text-textVar1 text-sm sm:text-base">
                        or
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            as="a"
                            href="/rankings"
                            className="whitespace-nowrap font-semibold"
                        >
                            View rankings
                        </Button>
                        <Button
                            as="a"
                            buttonStyle="outline"
                            href="/rankings/2v2"
                            className="whitespace-nowrap font-semibold"
                        >
                            2v2
                        </Button>
                    </div>
                </div>
            </div>
            <SectionTitle className="mt-0 mb-4" customMargin>
                Favorites
            </SectionTitle>
            {favorites.length > 0 ? (
                <FavoritesGrid favorites={favorites} />
            ) : (
                <p className="flex flex-col items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            You don&apos;t have any favorites yet, you can a
                            player or a clan as favorite when visiting their
                            profile page.
                            <Button as="a" href="/rankings">
                                View rankings
                            </Button>
                        </>
                    ) : (
                        <>
                            Log in to save your favorite players and clans.
                            <Button onClick={signIn} className="mt-2">
                                <DiscordIcon size="16" className="mr-2" />
                                Sign in
                            </Button>
                        </>
                    )}
                </p>
            )}
            <SectionTitle>Weekly Rotation</SectionTitle>
            <WeeklyRotation weeklyRotation={weeklyRotation} />

            {articles.length > 0 && (
                <>
                    <SectionTitle>Latest News</SectionTitle>
                    <ArticlePreviewGrid articles={articles} />
                </>
            )}
        </>
    )
}

export default Page
