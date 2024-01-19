"use client"

import { Button } from "ui/base/Button"
import { DiscordIcon } from "ui/icons"
import { FavoritesGrid } from "@/components/favorites/FavoritesGrid"
import { Trans } from "@lingui/macro"
import { useAuth, useFavorites } from "@/providers/auth/AuthProvider"

export const LandingFavorites = () => {
    const { isLoggedIn, signIn } = useAuth()
    const { favorites } = useFavorites()
    return (
        <div className="border border-bg border-dashed p-4 rounded-lg my-16">
            {favorites.length > 0 ? (
                <FavoritesGrid favorites={favorites} />
            ) : (
                <p className="flex flex-col items-center gap-4 py-4">
                    {isLoggedIn ? (
                        <>
                            <Trans>
                                You don&apos;t have any favorites yet, you can a
                                player or a clan as favorite when visiting their
                                profile page.
                            </Trans>
                            <Button as="a" href="/rankings">
                                <Trans>View rankings</Trans>
                            </Button>
                        </>
                    ) : (
                        <>
                            <span className="text-textVar1">
                                <Trans>
                                    Here you&apos;ll be able to see your
                                    favorite players and clans
                                </Trans>
                            </span>
                            <Button onClick={signIn} className="mt-2">
                                <DiscordIcon size="16" className="mr-2" />
                                <Trans>Sign in</Trans>
                            </Button>
                        </>
                    )}
                </p>
            )}
        </div>
    )
}
