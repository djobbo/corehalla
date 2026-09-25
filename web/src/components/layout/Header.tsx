import { AlertBar } from "./AlertBar"
import { AppLink } from "ui/base/AppLink"
import { Button } from "ui/base/Button"
import { DiscordIcon } from "ui/icons"
import { HamburgerMenuIcon } from "ui/icons"
import { HeaderSearch } from "../search/HeaderSearch"
import { Image } from "@components/Image"
import { cn } from "common/helpers/classnames"
import { useAuth } from "@ctx/auth/AuthProvider"
import { useIsLandingPage } from "common/hooks/useIsLandingPage"
import { useSideNav } from "@ctx/SideNavProvider"
import { useRouterState } from "@tanstack/react-router"
import { isSearchableRankingsPath } from "@/lib/search"

type HeaderProps = {
    className?: string
}

export const Header = ({ className }: HeaderProps) => {
    const { isLoggedIn, signIn, signOut, userProfile } = useAuth()
    const isLandingPage = useIsLandingPage()
    const { openSideNav } = useSideNav()
    const pathname = useRouterState({
        select: (state) => state.location.pathname,
    })

    const showHeaderSearch =
        !isLandingPage && !isSearchableRankingsPath(pathname)

    return (
        <>
            <AlertBar />
            <header>
                <div
                    className={cn(
                        className,
                        "grid grid-cols-[1fr_auto_1fr] items-center gap-3 h-12 px-3",
                    )}
                >
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Open navigation"
                            className="block sm:hidden"
                            onClick={() => {
                                openSideNav()
                            }}
                        >
                            <HamburgerMenuIcon size={18} />
                        </button>
                        <AppLink
                            href="/"
                            className="relative rounded-md w-24 h-6 overflow-hidden"
                        >
                            <Image
                                src="/images/logo.png"
                                alt="Corehalla logo"
                                className="object-contain object-center"
                                Container={null}
                            />
                        </AppLink>
                    </div>
                    <div className="flex justify-center">
                        {showHeaderSearch && (
                            <HeaderSearch className="w-40 sm:w-72 lg:w-96" />
                        )}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        {isLoggedIn ? (
                            <>
                                {userProfile && (
                                    <Image
                                        src={userProfile.avatarUrl}
                                        alt={userProfile.username}
                                        containerClassName="rounded-md w-6 h-6 overflow-hidden"
                                        className="object-cover object-center"
                                        unoptimized
                                    />
                                )}
                                <Button
                                    onClick={signOut}
                                    className="h-6 px-2 text-xs"
                                >
                                    Sign out
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={signIn}
                                className="h-6 px-2 text-xs"
                            >
                                <DiscordIcon size="14" className="mr-1.5" />
                                Sign in
                            </Button>
                        )}
                    </div>
                </div>
            </header>
        </>
    )
}
