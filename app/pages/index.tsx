import { ArrowSmRightIcon, DiscordIcon } from "ui/icons"
import { ArticlePreviewGrid } from "@components/articles/ArticlePreviewGrid"
import { Button } from "ui/base/Button"
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
import Balancer from "react-wrap-balancer"

const landingClassName = css({
    height: "60vh",
    minHeight: "400px",
})()

const Page = () => {
    const { isLoggedIn, signIn } = useAuth()
    const { favorites } = useFavorites()
    const { articles } = useBrawlhallaArticles("1", "", 3)
    const { weeklyRotation } = useWeeklyRotation()

    return (
        <>
            <SEO
                title="Track your Brawlhalla stats, view rankings, and more! • Corehalla"
                description="Improve Your Brawlhalla Game, and Find Your Place Among the
                Elite with Our In-Depth Player and Clan Stats Tracking and Live
                Leaderboards."
            />
            <div
                className={cn(
                    "flex flex-col justify-center items-center",
                    landingClassName,
                )}
            >
                <a
                    href="/discord"
                    target="_blank"
                    className="flex items-center gap-2 pl-3 pr-2 py-1 bg-bgVar1 rounded-full border border-bg text-sm hover:bg-bgVar2"
                    aria-label='Join our "Corehalla" Discord server'
                >
                    <span className="border-r border-r-bg pr-2">
                        Join our community of 1000+ players
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-center bg-gradient-to-l from-accent to-accentVar1 bg-clip-text text-fill-none">
                        Discord
                        <ArrowSmRightIcon className="w-4 h-4" />
                    </span>
                </a>
                <h1 className="text-center text-5xl sm:text-6xl font-bold mt-6 uppercase max-w-5xl">
                    <Balancer>Stay ahead of the competition.</Balancer>
                </h1>
                <p className="text-sm sm:text-base mt-3 text-center text-textVar1 max-w-xl">
                    <Balancer>
                        Improve your Brawlhalla Game, and find your place among
                        the Elite with our in-depth stats tracking and live
                        leaderboards.
                    </Balancer>
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
