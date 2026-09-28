import { Link, useLocation } from "@tanstack/react-router"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/cn"

/**
 * The section nav: how you get from one rankings surface to another, pinned
 * under the masthead.
 *
 * It sits in the header rather than on each page because these are *sections*,
 * not filters. The ladder's own chip row switches between brackets within one
 * surface; this one switches surfaces, and every page in the app gets it. Doing
 * it per page would mean each new surface had to remember to add itself, and a
 * surface that forgot would be reachable only by typing its URL.
 *
 * ## Why it is a menu now
 *
 * It used to be one flat row of chips — six surfaces abreast. That worked while
 * every surface was a peer, but it spent the whole row on links the reader
 * mostly does not want, and it left nowhere to put the *relationships*: the
 * three queues belong to the same idea as the three ladders, and legends and
 * weapons are views of one career board. A menu is what says so, and it is
 * `NavigationMenu` rather than hand-rolled disclosure because the hard parts —
 * roving focus across top-level items, open-on-hover with a shared viewport,
 * Escape and outside-click dismissal, the `aria-expanded`/`aria-controls` wiring
 * — are exactly the parts a bespoke version gets subtly wrong.
 *
 * ## Why the top level still navigates
 *
 * Each top-level item is a link as well as a submenu trigger: "Ranked" opens the
 * six surfaces *and* goes to the 1v1 ladder, which is what someone who does not
 * want the submenu is asking for. That is why the trigger renders as a router
 * `Link` — the click has somewhere to go rather than only toggling a panel.
 */
type NavLink = {
    readonly label: string
    readonly href: string
}

type NavColumn = {
    /** Absent when the column is the only one and the trigger already says it. */
    readonly heading?: string
    readonly links: readonly NavLink[]
}

type NavSection = {
    readonly label: string
    /** Where the top-level item itself goes. */
    readonly href: string
    /** Path prefixes that count as this section, for the current marker. */
    readonly match: readonly string[]
    /** Absent for an item with no submenu. */
    readonly columns?: readonly NavColumn[]
}

/*
 * The prefixes are spelled out rather than derived: `matches` below is a
 * prefix test, and a section is current whenever one of its surfaces is. The
 * ladders and the queues share the `Ranked` section because they are two views
 * of the same live standings — so its `match` lists all four prefixes — while
 * the three career boards collapse into one `/rankings/career` prefix because
 * they are views of one archive.
 */
const sections: readonly NavSection[] = [
    {
        label: "Ranked",
        href: "/rankings/live/1v1",
        match: [
            "/rankings/live/1v1",
            "/rankings/live/2v2",
            "/rankings/live/3v3",
            "/rankings/queues",
        ],
        columns: [
            {
                heading: "Ladders",
                links: [
                    { label: "1v1", href: "/rankings/live/1v1" },
                    { label: "2v2", href: "/rankings/live/2v2" },
                    { label: "3v3", href: "/rankings/live/3v3" },
                ],
            },
            {
                heading: "Queues",
                links: [
                    { label: "1v1", href: "/rankings/queues/1v1" },
                    { label: "2v2", href: "/rankings/queues/2v2" },
                    { label: "3v3", href: "/rankings/queues/3v3" },
                ],
            },
        ],
    },
    {
        label: "Career",
        href: "/rankings/career/players",
        match: ["/rankings/career"],
        columns: [
            {
                links: [
                    { label: "Players", href: "/rankings/career/players" },
                    { label: "Legends", href: "/rankings/career/legends" },
                    { label: "Weapons", href: "/rankings/career/weapons" },
                ],
            },
        ],
    },
    {
        label: "Guilds",
        href: "/rankings/guilds",
        match: ["/rankings/guilds"],
    },
]

const matches = (pathname: string, prefixes: readonly string[]): boolean =>
    prefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )

export const MainNav = () => {
    const { pathname } = useLocation()

    return (
        <nav aria-label="Rankings sections" className="ch-nav">
            <NavigationMenu>
                {/*
                 * A list, not a bare row of links: a screen reader then reports
                 * how many sections there are and where the reader is between
                 * them.
                 */}
                <NavigationMenuList>
                    {sections.map((section) => {
                        const current = matches(pathname, section.match)
                        const triggerClassName = cn(
                            navigationMenuTriggerStyle(),
                            // The item already reads as current to the eye;
                            // `aria-current` is what says so to everything else.
                            current && "text-foreground",
                        )

                        if (section.columns === undefined) {
                            return (
                                <NavigationMenuItem key={section.href}>
                                    <NavigationMenuLink
                                        className={triggerClassName}
                                        render={
                                            <Link
                                                to={section.href}
                                                aria-current={
                                                    current ? "page" : undefined
                                                }
                                            />
                                        }
                                    >
                                        {section.label}
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            )
                        }

                        return (
                            <NavigationMenuItem key={section.href}>
                                {/*
                                 * `nativeButton={false}` because `render` makes
                                 * this an anchor, not a button: without it Base
                                 * UI keeps button semantics the element does not
                                 * have.
                                 */}
                                <NavigationMenuTrigger
                                    nativeButton={false}
                                    className={triggerClassName}
                                    render={
                                        <Link
                                            to={section.href}
                                            aria-current={
                                                current ? "page" : undefined
                                            }
                                        />
                                    }
                                >
                                    {section.label}
                                </NavigationMenuTrigger>

                                <NavigationMenuContent>
                                    {/*
                                     * A row of columns, so the two Ranked columns
                                     * sit side by side and a one-column section
                                     * stays one column wide rather than
                                     * reserving half a grid for nothing.
                                     */}
                                    <div className="flex gap-6 p-1">
                                        {section.columns.map(
                                            (column, index) => (
                                                <div
                                                    key={
                                                        column.heading ??
                                                        String(index)
                                                    }
                                                    className="flex min-w-0 flex-col gap-1.5"
                                                >
                                                    {column.heading !==
                                                        undefined && (
                                                        <p className="ch-kicker">
                                                            {column.heading}
                                                        </p>
                                                    )}
                                                    <ul className="flex list-none flex-col">
                                                        {column.links.map(
                                                            (link) => {
                                                                const linkCurrent =
                                                                    matches(
                                                                        pathname,
                                                                        [
                                                                            link.href,
                                                                        ],
                                                                    )

                                                                return (
                                                                    <li
                                                                        key={
                                                                            link.href
                                                                        }
                                                                    >
                                                                        <NavigationMenuLink
                                                                            className={cn(
                                                                                linkCurrent &&
                                                                                    "text-foreground",
                                                                            )}
                                                                            render={
                                                                                <Link
                                                                                    to={
                                                                                        link.href
                                                                                    }
                                                                                    aria-current={
                                                                                        linkCurrent
                                                                                            ? "page"
                                                                                            : undefined
                                                                                    }
                                                                                />
                                                                            }
                                                                        >
                                                                            {
                                                                                link.label
                                                                            }
                                                                        </NavigationMenuLink>
                                                                    </li>
                                                                )
                                                            },
                                                        )}
                                                    </ul>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        )
                    })}
                </NavigationMenuList>
            </NavigationMenu>
        </nav>
    )
}
