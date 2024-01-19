import Link from "next/link"

export const alerts = {
    BH_MAINTENANCE: (
        <span>
            Brawlhalla maintenance ongoing. More info{" "}
            <Link
                href="/discord"
                target="_blank"
                className="text-accentAlt font-semibold hover:text-text"
            >
                here
            </Link>{" "}
            !
        </span>
    ),
    BH_SERVER_ISSUE: (
        <span>
            Known issues with fetching stats from Brawlhalla{"'"}s servers, don
            {"'"}t panic. Updates{" "}
            <Link
                href="/discord"
                target="_blank"
                className="text-accentAlt font-semibold hover:text-text"
            >
                here
            </Link>{" "}
            !
        </span>
    ),
    AUTH_ISSUES: (
        <span>
            Authentication server is down, and so favorites aren{"'"}t
            accessible, sorry for the inconvenience. Updates{" "}
            <Link
                href="/discord"
                target="_blank"
                className="text-accentAlt font-semibold hover:text-text"
            >
                here
            </Link>{" "}
            !
        </span>
    ),
    AUTH_ISSUES_RESOLVED: (
        <span>
            Authentication server is back online, you can reconnect! Don{"'"}t
            forget to join our{" "}
            <Link
                href="/discord"
                target="_blank"
                className="text-accentAlt font-semibold hover:text-text"
            >
                Discord
            </Link>{" "}
            !
        </span>
    ),
} as const
