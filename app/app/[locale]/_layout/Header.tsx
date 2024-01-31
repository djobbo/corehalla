"use client"

import { AlertBar } from "./AlertBar"
import { Button } from "ui/base/Button"
import {
    COREHALLA_DISCORD_URL,
    COREHALLA_GITHUB_URL,
    COREHALLA_TWITTER_URL,
} from "@/socials"
import { DiscordIcon, GithubIcon, TwitterIcon } from "ui/icons"
import { HamburgerMenuIcon } from "ui/icons"
import { Image } from "@/components/Image"
import {
    SearchButton,
    SearchButtonIcon,
} from "@/components/search/SearchButton"
import { Trans } from "@lingui/macro"
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth/AuthProvider"
import { usePathname } from "next/navigation"
import { useSideNav } from "@/providers/SideNavProvider"
import Link from "next/link"

type HeaderProps = {
    className?: string
}

export const Header = ({ className }: HeaderProps) => {
    const { isLoggedIn, signIn, signOut, userProfile } = useAuth()
    const pathname = usePathname()

    const { openSideNav } = useSideNav()

    const isLandingPage = pathname === "/"

    return (
        <>
            <AlertBar />
            <header className={cn({ "bg-bgVar2": !isLandingPage })}>
                <div
                    className={cn(
                        className,
                        "flex items-center justify-between h-16 sm:h-20 px-4",
                    )}
                >
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            className="block sm:hidden"
                            onClick={() => {
                                openSideNav()
                            }}
                        >
                            <HamburgerMenuIcon size={24} />
                        </button>
                        <Link
                            href="/"
                            className="relative rounded-lg w-32 h-8 overflow-hidden"
                        >
                            <Image
                                src="/images/logo.png"
                                alt="Corehalla logo"
                                className="object-contain object-center"
                                Container={null}
                            />
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <SearchButton
                            bg={isLandingPage ? "bg-bgVar2" : "bg-bgVar1"}
                            className="hidden sm:flex mr-2"
                        />
                        {isLoggedIn ? (
                            <>
                                {userProfile && (
                                    <>
                                        <div className="relative ">
                                            <Image
                                                src={userProfile.avatarUrl}
                                                alt={userProfile.username}
                                                containerClassName="rounded-lg w-8 h-8 overflow-hidden"
                                                className="object-cover object-center"
                                                unoptimized
                                            />
                                        </div>
                                    </>
                                )}
                                <Button onClick={signOut}>
                                    <Trans>Sign out</Trans>
                                </Button>
                            </>
                        ) : (
                            <Button onClick={signIn}>
                                <DiscordIcon size="16" className="mr-2" />
                                <Trans>Sign in</Trans>
                            </Button>
                        )}
                        <SearchButtonIcon
                            className="block sm:hidden px-2"
                            size={22}
                        />
                        <div className="hidden md:flex items-center gap-1 ml-2">
                            <Link
                                className="text-textVar1 hover:text-text"
                                href={COREHALLA_DISCORD_URL}
                                target="_blank"
                            >
                                <DiscordIcon size="16" className="mr-2" />
                            </Link>
                            <Link
                                className="text-textVar1 hover:text-text"
                                href={COREHALLA_TWITTER_URL}
                                target="_blank"
                            >
                                <TwitterIcon size="16" className="mr-2" />
                            </Link>
                            <Link
                                className="text-textVar1 hover:text-text"
                                href={COREHALLA_GITHUB_URL}
                                target="_blank"
                            >
                                <GithubIcon size="16" className="mr-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}
