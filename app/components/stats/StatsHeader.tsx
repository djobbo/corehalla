import { AdsenseStatsHeader } from "common/analytics/Adsense"
import { Button } from "ui/base/Button"
import { DiscordIcon } from "ui/icons"
import { HiUserAdd, HiUserRemove } from "react-icons/hi"
import { MiscStatGroup } from "./MiscStatGroup"
import { ShareIcon } from "ui/icons"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { useAuth, useFavorites } from "@ctx/auth/AuthProvider"
import { useCopyToClipboard } from "common/hooks/useCopyToClipboard"
import { useFeatureFlags } from "@hooks/useFeatures"
import toast from "react-hot-toast"
import type { Favorite } from "@ctx/auth/useUserFavorites"
import type { MiscStat } from "./MiscStatGroup"
import type { ReactNode } from "react"

type StatsHeaderProps = {
    name: string
    id: number
    icon?: ReactNode
    aliases?: string[]
    miscStats?: MiscStat[]
    favorite?: Favorite
}

export const StatsHeader = ({
    name,
    id,
    icon,
    aliases,
    miscStats,
    favorite,
}: StatsHeaderProps) => {
    const { isLoggedIn, signIn } = useAuth()
    const { isFavorite, removeFavorite, addFavorite } = useFavorites()
    const copyToClipboard = useCopyToClipboard()
    const { shouldShowAds } = useFeatureFlags()

    const isItemFavorite = favorite && isFavorite(favorite)

    return (
        <>
            <div
                className="w-full h-28 max-h-28 relative rounded-md overflow-hidden shadow-md"
                style={{
                    background: "url(/images/backgrounds/orion.jpg)",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                }}
            >
                {shouldShowAds && <AdsenseStatsHeader />}
            </div>
            <div className="flex flex-col sm:flex-row justify-end py-2 gap-2">
                {isLoggedIn ? (
                    favorite && (
                        <Button
                            buttonStyle={isItemFavorite ? "outline" : "primary"}
                            onClick={() => {
                                if (isItemFavorite)
                                    return removeFavorite(favorite)
                                addFavorite(favorite)
                            }}
                        >
                            {isItemFavorite ? (
                                <>
                                    Remove Favorite
                                    <HiUserRemove className="ml-2 w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Add favorite
                                    <HiUserAdd className="ml-2 w-4 h-4" />
                                </>
                            )}
                        </Button>
                    )
                ) : (
                    <Button buttonStyle="primary" onClick={signIn}>
                        <DiscordIcon size="16" className="mr-2" /> Sign in to
                        add favorites
                    </Button>
                )}
                <Button
                    buttonStyle="outline"
                    onClick={() => {
                        copyToClipboard(window.location.href)
                        toast("Copied link to clipboard!", {
                            icon: "📋",
                        })
                    }}
                >
                    <ShareIcon size="16" className="mr-2" /> Share
                </Button>
            </div>
            <div
                className={cn("flex flex-col justify-center items-center", {
                    "mt-8": !favorite,
                    "mt-4": !!favorite,
                })}
            >
                <h1 className="font-bold text-3xl lg:text-5xl flex items-center">
                    {icon}
                    {name}
                </h1>
                <span className="text-xs font-bold mt-1 text-textVar1">
                    #{id}
                </span>
            </div>
            {!!aliases && aliases.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {aliases.map((alias) => (
                        <p
                            key={alias}
                            className={cn("rounded-lg py-0.5 px-3 bg-bg")}
                        >
                            {cleanString(alias)}
                        </p>
                    ))}
                </div>
            )}
            {miscStats && (
                <MiscStatGroup
                    className="mt-8 justify-items-center text-center"
                    fit="fit"
                    stats={miscStats}
                />
            )}
        </>
    )
}
