import { ArrowSmRightIcon } from "ui/icons"
import { ArticlePreviewGrid } from "@/components/articles/ArticlePreviewGrid"
import { Button } from "ui/base/Button"
import { DiscordCard } from "./_landing/DiscordCard"
import { LandingFavorites } from "./_landing/LandingFavorites"
import { SearchButton } from "@/components/search/SearchButton"
import { SectionTitle } from "@/components/layout/SectionTitle"
import { Suspense } from "react"
import { Trans } from "@lingui/macro"
import { WeeklyRotation } from "./_landing/WeeklyRotation"
import { cn } from "@/lib/utils"
import { css } from "ui/theme"
import Link from "next/link"

const landingClassName = css({
    height: "60vh",
    minHeight: "400px",
})()

export const metadata = {
    title: "Corehalla - Track your Brawlhalla stats, view rankings, and more!",
    description:
        "Improve your Brawlhalla Game, and find your place among the Elite with our in-depth Player and Clan stats tracking and live leaderboards.",
}

export default async function Home() {
    return (
        <>
            <div className="flex flex-col items-center justify-center lg:gap-16 lg:flex-row">
                <div
                    className={cn(
                        "relative flex flex-col justify-center items-center lg:items-start",
                        landingClassName,
                        'after:content[""] after:absolute after:inset-0 after:bg-accent after:blur-[256px] after:opacity-[0.15] after:-z-10',
                    )}
                >
                    <Link
                        href="/discord"
                        target="_blank"
                        className="flex items-center gap-2 pl-3 pr-2 py-1 bg-bgVar1/75 rounded-full border border-bg text-sm hover:bg-bgVar2"
                        aria-label='Join our "Corehalla" Discord server'
                    >
                        <span className="border-r border-r-bg pr-2">
                            Join our community
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-center bg-gradient-to-l from-accent to-accentVar1 bg-clip-text text-fill-none">
                            Discord
                            <ArrowSmRightIcon className="w-4 h-4" />
                        </span>
                    </Link>
                    <h1
                        className={cn(
                            "text-center text-5xl sm:text-6xl font-bold mt-6 max-w-5xl",
                            "lg:text-start lg:max-w-3xl",
                        )}
                    >
                        Stay ahead of <br />
                        the competition
                    </h1>
                    <p
                        className={cn(
                            "text-center text-sm sm:text-base mt-3 text-textVar1 max-w-xl ",
                            "lg:text-start",
                        )}
                    >
                        Improve your Brawlhalla Game, and find your place among
                        the Elite with our in-depth stats tracking and live
                        leaderboards.
                    </p>
                    <div className="mt-8 flex items-center gap-3 sm:gap-6 flex-col sm:flex-row">
                        <SearchButton />
                        <span className="text-textVar1 text-sm sm:text-base">
                            <Trans>or</Trans>
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                as="a"
                                href="/rankings"
                                className="whitespace-nowrap font-semibold"
                            >
                                <Trans>View rankings</Trans>
                            </Button>
                            <Button
                                as="a"
                                buttonStyle="outline"
                                href="/rankings/2v2"
                                className="whitespace-nowrap font-semibold"
                            >
                                <Trans>2v2</Trans>
                            </Button>
                        </div>
                    </div>
                </div>
                <div>
                    <DiscordCard />
                    <Link
                        href="/discord"
                        target="_blank"
                        aria-label="Discord server link"
                        className="block text-sm mt-2 text-textVar1 text-center"
                    >
                        corehalla.com/discord
                    </Link>
                </div>
            </div>
            <LandingFavorites />
            <Suspense fallback={<div>Loading free legend rotation...</div>}>
                <WeeklyRotation />
            </Suspense>
            <SectionTitle className="text-center mt-16">
                Latest News
            </SectionTitle>
            <Suspense fallback={<div>Loading articles...</div>}>
                <ArticlePreviewGrid first={3} category="" />
            </Suspense>
        </>
    )
}
