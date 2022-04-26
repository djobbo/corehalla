import { Button } from "../base/Button"
import { SearchButton } from "../search/SearchButton"
import { cn } from "common/helpers/classnames"
import { useAuth } from "db/client/AuthProvider"
import { useRouter } from "next/router"
import Image from "next/image"
import Link from "next/link"

type HeaderProps = {
    className?: string
}

export const Header = ({ className }: HeaderProps) => {
    const { isLoggedIn, signIn, signOut, userProfile } = useAuth()
    const router = useRouter()

    const isLandingPage = router.pathname === "/"

    return (
        <header
            className={cn(
                'before:relative before:block before:content-[""] before:w-full before:h-1 before:bg-accent before:from-accent before:to-accentAlt',
                { "bg-bgVar2": !isLandingPage },
            )}
        >
            <div
                className={cn(
                    className,
                    "flex items-center justify-between h-20 px-8",
                )}
            >
                <div className="flex items-center">
                    <Link href="/">
                        <a className="relative rounded-lg w-32 h-8 overflow-hidden">
                            <Image
                                src="/images/logo.png"
                                alt="Corehalla logo"
                                layout="fill"
                                objectFit="contain"
                                objectPosition="center"
                            />
                        </a>
                    </Link>
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
                        <Button onClick={signIn}>Sign in</Button>
                    )}
                </div>
            </div>
        </header>
    )
}
