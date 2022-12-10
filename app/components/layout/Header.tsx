import { AlertBar } from "./AlertBar"
import { AppLink } from "ui/base/AppLink"
import { Button } from "ui/base/Button"
import { DiscordIcon, GithubIcon, TwitterIcon } from "ui/icons"
import { HamburgerMenuIcon } from "ui/icons"
import { Image } from "@components/Image"
import { SearchButtonIcon } from "../search/SearchButton"
import { cn } from "common/helpers/classnames"
import { useAuth } from "@ctx/auth/AuthProvider"
import { useRouter } from "next/router"
import { useSideNav } from "@ctx/SideNavProvider"

type HeaderProps = {
    className?: string
}

export const Header = ({ className }: HeaderProps) => {
    const { isLoggedIn, signIn, signOut, userProfile } = useAuth()
    const router = useRouter()

    const { openSideNav } = useSideNav()

    const isLandingPage = router.pathname === "/"

    return (
        <>
            <AlertBar alert="BH_SERVER_ISSUE" />
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
                        <AppLink
                            href="/"
                            className="relative rounded-lg w-32 h-8 overflow-hidden"
                        >
                            <Image
                                src="/images/logo.png"
                                alt="Corehalla logo"
                                className="object-contain object-center"
                                Container={null}
                            />
                        </AppLink>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* <SearchButton
                            bg={isLandingPage ? "bg-bgVar2" : "bg-bgVar1"}
                            className="hidden sm:flex mr-2"
                        /> */}
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
                                <Button onClick={signOut}>Sign out</Button>
                            </>
                        ) : (
                            <Button onClick={signIn}>
                                <DiscordIcon size="16" className="mr-2" />
                                Sign in
                            </Button>
                        )}
                        <SearchButtonIcon
                            className="block sm:hidden px-2"
                            size={22}
                        />
                        <div className="hidden md:flex items-center gap-1 ml-2">
                            <AppLink
                                className="text-textVar1 hover:text-text"
                                href="/discord"
                                target="_blank"
                            >
                                <DiscordIcon size="16" className="mr-2" />
                            </AppLink>
                            <AppLink
                                className="text-textVar1 hover:text-text"
                                href="/twitter"
                                target="_blank"
                            >
                                <TwitterIcon size="16" className="mr-2" />
                            </AppLink>
                            <AppLink
                                className="text-textVar1 hover:text-text"
                                href="/github"
                                target="_blank"
                            >
                                <GithubIcon size="16" className="mr-2" />
                            </AppLink>
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}
