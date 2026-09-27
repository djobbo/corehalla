import { Link, useLocation } from "@tanstack/react-router"
import { cn } from "@/lib/cn"

/**
 * The section nav: one chip per rankings surface, pinned under the masthead.
 *
 * It sits in the header rather than on each page because these are *sections*,
 * not filters. The ladder's own chip row switches between brackets within one
 * surface; this one switches surfaces, and every page in the app gets it. Doing
 * it per page would mean each new surface had to remember to add itself, and a
 * surface that forgot would be reachable only by typing its URL.
 *
 * Three items, and deliberately not the individual ladders. 1v1/2v2/3v3 are
 * already one tap away in the ladder's own filter row, and repeating them here
 * would put two controls that look identical — same chip, same row, same
 * styling — thirty pixels apart while meaning different things.
 *
 * Which item is current is decided from the pathname rather than from the
 * router's match state, because two of these are *prefixes* of the third's
 * neighbourhood: `/rankings/global` must not light up `/rankings/1v1`. Spelling
 * the prefixes out is what makes that unambiguous.
 */

type Section = {
    readonly label: string
    readonly href: string
    /** Path prefixes that count as this section. */
    readonly match: readonly string[]
}

const sections: readonly Section[] = [
    {
        label: "Rankings",
        href: "/rankings/1v1",
        // The three ladders, and nothing else under `/rankings`.
        match: ["/rankings/1v1", "/rankings/2v2", "/rankings/3v3"],
    },
    {
        label: "Global",
        href: "/rankings/global",
        match: ["/rankings/global"],
    },
    {
        label: "Legends",
        href: "/rankings/legends",
        match: ["/rankings/legends"],
    },
    {
        label: "Weapons",
        href: "/rankings/weapons",
        match: ["/rankings/weapons"],
    },
    {
        label: "Clans",
        href: "/rankings/clans",
        match: ["/rankings/clans"],
    },
]

const isCurrent = (pathname: string, section: Section): boolean =>
    section.match.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )

export const MainNav = () => {
    const { pathname } = useLocation()

    return (
        <nav aria-label="Rankings sections" className="ch-nav">
            <div>
                {sections.map((section) => {
                    const current = isCurrent(pathname, section)

                    return (
                        <Link
                            key={section.href}
                            to={section.href}
                            // The chip already reads as active to the eye.
                            // `aria-current` is what says so to everything else.
                            aria-current={current ? "page" : undefined}
                            className={cn(
                                "ch-chip",
                                current ? "ch-chip-on" : "ch-chip-off",
                            )}
                        >
                            {section.label}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
