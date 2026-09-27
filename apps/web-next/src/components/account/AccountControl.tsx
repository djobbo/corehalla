import { Link } from "@tanstack/react-router"
import { useAtomSet, useAtomValue } from "@effect/atom-react"
import { useRef } from "react"
import { sessionAtom, signIn, signOutAtom } from "@/effect/account"
import { SignOutIcon } from "@/components/ui/icons"
import { cn } from "@/lib/cn"

/**
 * Who is signed in, and the way in or out.
 *
 * Client-only by construction: the session is an `HttpOnly` cookie the server
 * render cannot read, so a server-rendered guess would be replaced on hydration.
 * The caller mounts this behind `<ClientOnly>`; the placeholder below is what
 * the first client pass shows while the session request is in flight.
 *
 * The menu is a native `<details>`. A dropdown is the one thing here that needs
 * open/closed state, and the browser already owns that interaction — including
 * keyboard and click-outside behaviour — so a menu primitive would be a
 * dependency bought for a triangle.
 */
export const AccountControl = () => {
    const session = useAtomValue(sessionAtom)
    const signOut = useAtomSet(signOutAtom, { mode: "promise" })
    const details = useRef<HTMLDetailsElement>(null)

    const close = () => {
        if (details.current) details.current.open = false
    }

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
            <button type="button" className="ch-btn" onClick={signIn}>
                Sign in
            </button>
        )
    }

    return (
        <details ref={details} className="relative">
            <summary
                className={cn(
                    "ch-chip ch-chip-off cursor-pointer list-none",
                    "marker:content-none",
                )}
                title={user.username}
            >
                {user.avatarUrl ? (
                    <img
                        src={user.avatarUrl}
                        alt=""
                        className="h-5 w-5 object-cover"
                    />
                ) : (
                    <span aria-hidden>
                        {user.username.slice(0, 1).toUpperCase()}
                    </span>
                )}
                <span className="max-w-24 truncate">{user.username}</span>
            </summary>

            <div className="ch-panel absolute right-0 z-30 mt-2 w-52 p-2">
                <Link
                    to="/@me/favorites"
                    onClick={close}
                    className="ch-field w-full"
                >
                    My favorites
                </Link>
                <button
                    type="button"
                    onClick={handleSignOut}
                    className="ch-field w-full"
                >
                    <span>Sign out</span>
                    <SignOutIcon className="h-4 w-4" />
                </button>
            </div>
        </details>
    )
}
