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

/**
 * Who is signed in, and the way in or out.
 *
 * Client-only by construction: the session is an `HttpOnly` cookie the server
 * render cannot read, so a server-rendered guess would be replaced on hydration.
 * The caller mounts this behind `<ClientOnly>`; the placeholder below is what
 * the first client pass shows while the session request is in flight.
 *
 * The account actions are a shadcn `DropdownMenu`, which is what this popover
 * always meant to be: a menu of two things. It brings the roles, arrow-key
 * roving focus, Escape-to-close and click-outside handling that used to be
 * borrowed from a native `<details>`, and — unlike that — a menu that stays
 * anchored to its trigger and announces itself as a menu.
 *
 * The trigger and both actions keep the parallelogram chip, the app's own
 * shape: see `.ch-chip` in `styles/app.css`. Only the sign-in button, which is
 * a genuine button, wears shadcn's `Button`.
 */
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
                    {/*
                     * A real link, not a button with a handler: the favourites
                     * page is a place, so it should stay middle-clickable and
                     * shareable. `closeOnClick` is the menu clearing itself as
                     * the navigation starts.
                     */}
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
