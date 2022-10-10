import { ArticlePreviewGrid } from "@components/articles/ArticlePreviewGrid"
import { Button } from "ui/base/Button"
import { Discord } from "@icons-pack/react-simple-icons"
import { FavoritesGrid } from "@components/favorites/FavoritesGrid"
import { SEO } from "@components/SEO"
import { SearchButton } from "@components/search/SearchButton"
import { SectionTitle } from "@components/layout/SectionTitle"
import { Tooltip } from "ui/base/Tooltip"
import { cn } from "common/helpers/classnames"
import { css } from "ui/theme"
import { useAuth, useFavorites } from "@ctx/auth/AuthProvider"
import { useBrawlhallaArticles } from "@hooks/useBrawlhallaArticles"
import { useWeeklyRotation } from "@hooks/useWeeklyRotation"
import Image from "next/image"

const landingClassName = css({
    height: "60vh",
    minHeight: "400px",
})()

const Page = () => {
    const { isLoggedIn, signIn } = useAuth()
    const { favorites } = useFavorites()
    const { articles } = useBrawlhallaArticles(1, "patch-notes", 3)
    const { weeklyRotation } = useWeeklyRotation()

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
                <span className="text-2xl font-bold uppercase bg-gradient-to-l from-accent to-accentVar1 bg-clip-text text-fill-none">
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
                            You need to be logged in to see your favorites.
                            <Button onClick={signIn}>
                                <Discord size="16" className="mr-2" />
                                Sign in
                            </Button>
                        </>
                    )}
                </p>
            )}
            {weeklyRotation.length > 0 && (
                <>
                    <SectionTitle>Weekly Rotation</SectionTitle>
                    <div className="flex gap-2">
                        {weeklyRotation.map((legend) => (
                            <Tooltip
                                key={legend.legend_id}
                                content={legend.bio_name}
                            >
                                <div className="relative w-16 h-16 rounded-md">
                                    <Image
                                        src={`/images/icons/roster/legends/${legend.bio_name}.png`}
                                        alt={legend.bio_name}
                                        layout="fill"
                                        objectFit="contain"
                                        objectPosition="center"
                                    />
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                </>
            )}
            {articles.length > 0 && (
                <>
                    <SectionTitle>Latest Patches</SectionTitle>
                    <ArticlePreviewGrid articles={articles} />
                </>
            )}
        </>
    )
}

export default Page
