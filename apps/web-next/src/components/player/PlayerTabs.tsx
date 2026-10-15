import { Link } from "@tanstack/react-router"
import { playerHref } from "@/lib/rankings"

export const PlayerTabs = ({
    slug,
    show2v2,
}: {
    readonly slug: string
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
        <nav
            aria-label="Profile sections"
            className="ch-tabline sticky top-[var(--ch-header-h)] z-20 bg-background/95 backdrop-blur"
        >
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
