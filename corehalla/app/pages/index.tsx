import { ArticlePreviewGrid } from "ui/articles/ArticlePreviewGrid"
import { Button } from "ui/base/Button"
import { FavoritesGrid } from "ui/favorites/FavoritesGrid"
import { SEO } from "../components/SEO"
import { SearchButton } from "ui/search/SearchButton"
import { SectionTitle } from "ui/layout/SectionTitle"
import { cn } from "common/helpers/classnames"
import { css } from "ui/theme"
import { logError } from "logger"
import { parseBHArticlesPage } from "web-parser/bh-articles/parseBHArticlesPage"
import { useAuth, useFavorites } from "db/client/AuthProvider"
import type { BHArticle } from "web-parser/bh-articles/parseBHArticlesPage"
import type { GetServerSideProps } from "next"

const landingClassName = css({
    height: "50vh",
    minHeight: "400px",
})()

type PageProps = {
    latestArticles: BHArticle[]
}

const Page = ({ latestArticles }: PageProps) => {
    const { isLoggedIn, signIn } = useAuth()
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
            <SectionTitle>Favorites</SectionTitle>
            {favorites.length > 0 ? (
                <FavoritesGrid favorites={favorites} />
            ) : (
                <p className="flex flex-col items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            You don&apos;t have any favorites yet, you can a
                            player or a clan as favorite when visiting their
                            profile page.
                            <Button onClick={signIn}>View rankings</Button>
                        </>
                    ) : (
                        <>
                            You need to be logged in to see your favorites.
                            <Button onClick={signIn}>
                                Sign in with discord
                            </Button>
                        </>
                    )}
                </p>
            )}

            {latestArticles.length > 0 && (
                <>
                    <SectionTitle>Latest Patches</SectionTitle>
                    <ArticlePreviewGrid articles={latestArticles} />
                </>
            )}
        </>
    )
}

export default Page

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
    res,
}) => {
    res.setHeader(
        "Cache-Control",
        `public, s-maxage=1200, stale-while-revalidate=${60 * 60 * 24 * 7}`,
    )

    let latestArticles: BHArticle[] = []

    try {
        latestArticles = (await parseBHArticlesPage(1, "patch-notes")).slice(
            0,
            3,
        )
    } catch {
        logError("Failed to parse latest articles")
    }

    return {
        props: {
            latestArticles,
        },
    }
}
