import { discordUrl } from "./communityLinks"

export type AlertLink = {
    readonly label: string
    readonly href: string
}

export type Alert = {
    readonly text: string
    readonly link?: AlertLink
}

/**
 * The messages an operator can put above the masthead, selected at build time
 * through `VITE_ALERT`. The keys are stable handles for a deployment, so the
 * copy can change without touching the environment that switches it on.
 *
 * Discord destinations bypass the legacy redirect routes and point straight at
 * the invite, so an alert still works if a redirect is ever retired.
 */
export const alerts = {
    BH_MAINTENANCE: {
        text: "Brawlhalla is offline for scheduled maintenance. Live ladders may be stale until the servers return.",
    },
    BH_SERVER_ISSUE: {
        text: "Brawlhalla's stats servers are struggling, so player and ranking data may lag behind. We're watching it.",
        link: { label: "Discord updates", href: discordUrl },
    },
    AUTH_ISSUES: {
        text: "Sign-in is unavailable, so favourites and account pages can't load right now. We're on it.",
        link: { label: "Discord updates", href: discordUrl },
    },
    AUTH_ISSUES_RESOLVED: {
        text: "Sign-in is back. Reconnect your account to see your favourites and profile again.",
    },
    NEW_BH_WIKI: {
        text: "The Brawlhalla Wiki has moved to its new home on wiki.gg.",
        link: { label: "Visit the wiki", href: "https://brawlhalla.wiki.gg" },
    },
} as const satisfies Record<string, Alert>

export type AlertKey = keyof typeof alerts

/** The alert a key names, or `null` for an unset or unknown key. */
export const currentAlert = (key: string | undefined): Alert | null => {
    if (key === undefined || key === "") return null

    return Object.hasOwn(alerts, key) ? alerts[key as AlertKey] : null
}
