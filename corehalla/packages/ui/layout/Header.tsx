import { Button } from "../base/Button"
import { SearchButton } from "../search/SearchButton"
import { border } from "../theme"
import { cn } from "common/helpers/classnames"
import { useAuth } from "db/client/AuthProvider"
import Image from "next/image"

export const Header = () => {
    const { isLoggedIn, signIn, signOut, userProfile } = useAuth()

    return (
        <header
            className={cn(
                "flex items-center justify-between mx-auto h-16 px-8 mb-8 border-b",
                border("blue4"),
            )}
        >
            <div className="flex items-center">
                <div className="relative rounded-lg w-32 h-8 overflow-hidden">
                    <Image
                        src="/images/logo.png"
                        alt="Corehalla logo"
                        layout="fill"
                        objectFit="contain"
                        objectPosition="center"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <SearchButton />
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
        </header>
    )
}
