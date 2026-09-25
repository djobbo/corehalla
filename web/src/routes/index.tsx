import { ArticlePreviewGrid } from "@components/articles/ArticlePreviewGrid"
import { Button } from "ui/base/Button"
import { DiscordIcon } from "ui/icons"
import { FavoritesGrid } from "@components/favorites/FavoritesGrid"
import { HarnessComposer } from "@components/landing/HarnessComposer"
import { SectionTitle } from "@components/layout/SectionTitle"
import { articlesAtom } from "@/effect/atoms"
import { createFileRoute } from "@tanstack/react-router"
import { seoTags } from "@components/SEO"
import { useAtomValue } from "@effect/atom-react"
import { useAuth, useFavorites } from "@ctx/auth/AuthProvider"

export const Route = createFileRoute("/")({
    head: () => ({
        meta: seoTags({
            title: "Track your Brawlhalla stats, view rankings, and more! • Corehalla",
            description:
                "Improve your Brawlhalla Game, and find your place among the Elite with our in-depth Player and Clan stats tracking and live leaderboards.",
        }),
    }),
    component: Page,
})

function Page() {
    const { isLoggedIn, signIn } = useAuth()
    const { favorites } = useFavorites()

    // The news grid stays client-fetched, matching the Next.js app which opted
    // it out of SSR.
    const articlesResult = useAtomValue(articlesAtom("", 3))
    const articles =
        articlesResult._tag === "Success" ? articlesResult.value : []

    return (
        <>
            <HarnessComposer />
            <div className="border border-bg border-dashed p-4 rounded-lg mb-16">
                {favorites.length > 0 ? (
                    <FavoritesGrid favorites={favorites} />
                ) : (
                    <p className="flex flex-col items-center gap-4 py-4">
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
                                <span className="text-textVar1">
                                    Here you{"'"}ll be able to see your favorite
                                    players and clans
                                </span>
                                <Button onClick={signIn} className="mt-2">
                                    <DiscordIcon size="16" className="mr-2" />
                                    Sign in
                                </Button>
                            </>
                        )}
                    </p>
                )}
            </div>
            {articles.length > 0 && (
                <>
                    <SectionTitle className="text-center mt-16">
                        Latest News
                    </SectionTitle>
                    <ArticlePreviewGrid articles={articles} />
                </>
            )}
        </>
    )
}
