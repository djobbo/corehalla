import { Link } from "@tanstack/react-router"

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
 */
export const PlayerTabs = ({
    playerId,
    show2v2,
}: {
    readonly playerId: number
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
            href: `/stats/players/${playerId}`,
        },
        ...(show2v2
            ? [
                  {
                      tab: "2v2",
                      label: "2v2 Ranked",
                      href: `/stats/players/${playerId}/2v2`,
                  },
              ]
            : []),
        {
            tab: "legends",
            label: "Legends",
            href: `/stats/players/${playerId}/legends`,
        },
        {
            tab: "weapons",
            label: "Weapons",
            href: `/stats/players/${playerId}/weapons`,
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
