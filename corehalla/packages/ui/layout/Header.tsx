import { Button } from "../base/Button"
import { SearchButton } from "../search/SearchButton"
import { border } from "../theme"
import { cn } from "common/helpers/classnames"
import { useAuth } from "db/client/AuthProvider"

export const Header = () => {
    const { isLoggedIn, signIn, signOut } = useAuth()

    return (
        <header
            className={cn(
                "flex items-center justify-between mx-auto h-16 px-8 mb-8 border-b",
                border("blue4"),
            )}
        >
            <div className="flex items-center"></div>
            <div className="flex items-center gap-4">
                <SearchButton />
                {isLoggedIn ? (
                    <Button onClick={signOut}>Sign out</Button>
                ) : (
                    <Button onClick={signIn}>Sign in</Button>
                )}
            </div>
        </header>
    )
}
