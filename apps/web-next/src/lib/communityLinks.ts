export type CommunityLink = {
    readonly label: string
    readonly href: string
}

/**
 * The destinations the legacy `/discord`, `/twitter`, `/github` and `/donate`
 * stubs redirect to, resolved here to the external URL so the footer never
 * needs a hop through a redirect route.
 */
export const communityLinks = [
    { label: "Discord", href: "https://discord.com/invite/eD248ez" },
    { label: "X (Twitter)", href: "https://twitter.com/Corehalla" },
    { label: "GitHub", href: "https://github.com/djobbo/corehalla" },
    { label: "Ko-fi", href: "https://ko-fi.com/corehalla" },
] as const satisfies readonly CommunityLink[]

export const attribution =
    "Visual assets courtesy of Blue Mammoth Games & Freepik - Flaticon."

export const disclaimer =
    "Corehalla is neither associated nor endorsed by Blue Mammoth Games and doesn't reflect the views or opinions of Blue Mammoth Games or anyone officially involved in developing Brawlhalla."

export const trademark =
    "Brawlhalla and Blue Mammoth Games are trademarks of Blue Mammoth Games."
