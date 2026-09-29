import { Link } from "@tanstack/react-router"
import { playerHref } from "@/lib/rankings"

/**
 * The profile's tab strip.
 *
 * Underlines rather than the app's usual parallelogram chips — the header is a
 * dense block of information and the tabs need to sit *under* it as a quiet
 * baseline, not compete with it as five more buttons.
 *
 * Every tab is a real route, so the strip is a row of links rather than a
 * controlled tab widget: each tab is shareable, reloadable and preloadable, and
 * `activeOptions` decides the highlight from the URL alone.
 *
 * ## Why the links take the slug, not the id
 *
 * The route segment is a canonical slug (`1234-boomie`), and a link that spells
 * the bare id is a *different* `$id` as far as the router is concerned. Two
 * things then go wrong at once, and neither looks like a link bug: the parent
 * loader sees a non-canonical segment and redirects — dropping the tab segment
 * with it, so every tab lands on the overview — and `activeOptions` never
 * matches, so no underline is drawn. Passing the slug through is what keeps the
 * link and the location describing the same route.
 */
export const PlayerTabs = ({
    slug,
    show2v2,
}: {
    /** The canonical URL segment, from the profile itself. */
    readonly slug: string
    /** The legacy client hides the tab entirely when there is no team record. */
    readonly show2v2: boolean
}) => {
    const tabs: readonly {
        readonly tab: string
        readonly label: string
        readonly href: string
    }[] = [
        {
            tab: "overview",
            label: "Overview",
            href: playerHref(slug),
        },
        ...(show2v2
            ? [
                  {
                      tab: "2v2",
                      label: "2v2 Ranked",
                      href: playerHref(slug, "2v2"),
                  },
              ]
            : []),
        {
            tab: "legends",
            label: "Legends",
            href: playerHref(slug, "legends"),
        },
        {
            tab: "weapons",
            label: "Weapons",
            href: playerHref(slug, "weapons"),
        },
    ]

    return (
        <nav aria-label="Profile sections" className="ch-tabline mt-4">
            {tabs.map(({ tab, label, href }) => (
                <Link
                    key={tab}
                    to={href}
                    activeOptions={{ exact: true }}
                    className="ch-tablink"
                    activeProps={{ className: "ch-tablink ch-tablink-on" }}
                >
                    {label}
                </Link>
            ))}
        </nav>
    )
}
