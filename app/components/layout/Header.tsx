import { AppLink } from "ui/base/AppLink"
import { Button } from "ui/base/Button"
import { SearchButton } from "../search/SearchButton"
import { SiDiscord, SiGithub, SiTwitter } from "react-icons/si"
import { cn } from "common/helpers/classnames"
import { useAuth } from "@ctx/auth/AuthProvider"
import { useRouter } from "next/router"
import Image from "next/image"

type HeaderProps = {
    className?: string
}

export const Header = ({ className }: HeaderProps) => {
    const { isLoggedIn, signIn, signOut, userProfile } = useAuth()
    const router = useRouter()

    const isLandingPage = router.pathname === "/"

    return (
        <header className={cn({ "bg-bgVar2": !isLandingPage })}>
            <div
                className={cn(
                    className,
                    "flex items-center justify-between h-20 px-8",
                )}
            >
                <div className="flex items-center">
                    <AppLink
                        href="/"
                        className="relative rounded-lg w-32 h-8 overflow-hidden"
                    >
                        <Image
                            src="/images/logo.png"
                            alt="Corehalla logo"
                            layout="fill"
                            objectFit="contain"
                            objectPosition="center"
                        />
                    </AppLink>
                </div>
                <div className="flex items-center gap-4">
                    <SearchButton
                        bg={isLandingPage ? "bg-bgVar2" : "bg-bgVar1"}
                    />
                    {isLoggedIn ? (
                        <>
                            {userProfile && (
                                <>
                                    <div className="relative rounded-lg w-8 h-8 overflow-hidden">
                                        <Image
                                            src={userProfile.avatarUrl}
                                            alt={userProfile.username}
                                            layout="fill"
                                            objectFit="cover"
                                            objectPosition="center"
                                        />
                                    </div>
                                </>
                            )}
                            <Button onClick={signOut}>Sign out</Button>
                        </>
                    ) : (
                        <Button onClick={signIn}>
                            <SiDiscord size="16" className="mr-2" />
                            Sign in
                        </Button>
                    )}
                    <div className="flex items-center gap-1">
                        <AppLink
                            className="text-textVar1 hover:text-text"
                            href="/twitter"
                            target="_blank"
                        >
                            <SiTwitter size="16" className="mr-2" />
                        </AppLink>
                        <AppLink
                            className="text-textVar1 hover:text-text"
                            href="/github"
                            target="_blank"
                        >
                            <SiGithub size="16" className="mr-2" />
                        </AppLink>
                        <AppLink
                            className="text-textVar1 hover:text-text"
                            href="/discord"
                            target="_blank"
                        >
                            <SiDiscord size="16" className="mr-2" />
                        </AppLink>
                    </div>
                </div>
            </div>
        </header>
    )
}
