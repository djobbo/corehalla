import { Link } from "@tanstack/react-router"
import { useAtomSet, useAtomValue } from "@effect/atom-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { sessionAtom, signIn, signOutAtom } from "@/effect/account"
import { LogOut } from "lucide-react"

export const AccountControl = () => {
    const session = useAtomValue(sessionAtom)
    const signOut = useAtomSet(signOutAtom, { mode: "promise" })

    const handleSignOut = () => {
        void signOut({
            reactivityKeys: ["session", "favorites", "connections"],
        })
            .catch(() => undefined)
            .finally(() => window.location.assign("/"))
    }

    if (session._tag === "Initial") {
        return (
            <span
                aria-hidden
                className="ch-chip ch-chip-off opacity-60"
                title="Checking your session"
            >
                …
            </span>
        )
    }

    const user = session._tag === "Success" ? session.value.user : null

    if (!user) {
        return (
            <Button type="button" variant="secondary" onClick={signIn}>
                Sign in
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={`Account menu for ${user.username}`}
                title={user.username}
                className="ch-chip ch-chip-off cursor-pointer"
            >
                {user.avatarUrl ? (
                    <img
                        src={user.avatarUrl}
                        alt=""
                        className="size-5 object-cover"
                    />
                ) : (
                    <span aria-hidden>
                        {user.username.slice(0, 1).toUpperCase()}
                    </span>
                )}
                <span className="max-w-24 truncate">{user.username}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        nativeButton={false}
                        render={<Link to="/@me/favorites" />}
                        closeOnClick
                    >
                        My favorites
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={handleSignOut}
                    >
                        <LogOut aria-hidden />
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
