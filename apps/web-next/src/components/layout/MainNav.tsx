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
import { newsCategories, newsHref } from "@/lib/news"

type NavLink = {
    readonly label: string
    readonly href: string
}

type NavColumn = {
    readonly heading?: string
    readonly links: readonly NavLink[]
}

type NavSection = {
    readonly label: string
    readonly href: string
    readonly match: readonly string[]
    readonly columns?: readonly NavColumn[]
}

const sections: readonly NavSection[] = [
    {
        label: "Ranked",
        href: "/rankings/live/1v1",
        match: [
            "/rankings/live/1v1",
            "/rankings/live/2v2",
            "/rankings/live/3v3",
            "/rankings/queues",
            "/rankings/power",
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
                heading: "Power rankings",
                links: [
                    { label: "1v1", href: "/rankings/power/1v1" },
                    { label: "2v2", href: "/rankings/power/2v2" },
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
    {
        label: "News",
        href: "/news",
        match: ["/news"],
        columns: [
            {
                heading: "Categories",
                links: newsCategories.map((category) => ({
                    label: category.label,
                    href: newsHref(category.slug),
                })),
            },
        ],
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
                <NavigationMenuList>
                    {sections.map((section) => {
                        const current = matches(pathname, section.match)
                        const triggerClassName = cn(
                            navigationMenuTriggerStyle(),

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
                                <NavigationMenuTrigger
                                    // `render` makes this an anchor; without this Base UI keeps button semantics.
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
