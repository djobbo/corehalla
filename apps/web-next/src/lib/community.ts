import { discordUrl, kofiUrl } from "./communityLinks"

export type CommunityActionId = "join" | "support"

export type CommunityAction = {
    readonly id: CommunityActionId
    readonly label: string
    readonly href: string
}

export type CommunityAnswer = {
    readonly label: string
    readonly href: string
}

/**
 * The question the landing asks visitors to answer in Discord. It changes with
 * the community, so it lives here rather than in the component.
 */
export const communityPrompt =
    "Which weapon do you enjoy playing most — and which one do you avoid?"

/** The question's own link into Discord, worded so it names where it goes. */
export const communityAnswer: CommunityAnswer = {
    label: "Share your thoughts in Discord",
    href: discordUrl,
}

export const communityActions = [
    { id: "join", label: "Join", href: discordUrl },
    { id: "support", label: "Support", href: kofiUrl },
] as const satisfies readonly CommunityAction[]
