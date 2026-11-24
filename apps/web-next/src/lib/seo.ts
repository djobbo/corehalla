import { parseEntityId } from "@crh/common/helpers/entitySlug"
import { legendsMap } from "@crh/bhapi/legends"
import { absoluteUrl } from "./assets"
import { regionLabel } from "./rankings"
import type { Ladder, RankedRegion } from "@crh/api-contract/schemas"
import type { Weapon } from "@crh/bhapi/constants"
import type { PowerGameMode, PowerRegion } from "./rankings"

type Region = typeof RankedRegion.Type

/**
 * Lives in `apps/web/public`, served here through the `publicDir` override.
 * Social scrapers need an absolute URL, which `absoluteUrl` supplies on deploy.
 */
export const DEFAULT_OG_IMAGE = "/images/og/main-og.jpg"

export type SeoMeta =
    | { readonly title: string }
    | { readonly name: string; readonly content: string }
    | { readonly property: string; readonly content: string }

type SeoLink = { readonly rel: string; readonly href: string }

type SeoHead = {
    readonly meta: SeoMeta[]
    readonly links: SeoLink[]
}

type SeoInput = {
    readonly title: string
    readonly description: string
    readonly path: string
    readonly image?: string | undefined
    readonly type?: string | undefined
    readonly noindex?: boolean | undefined
}

export const seoTags = ({
    title,
    description,
    path,
    image = DEFAULT_OG_IMAGE,
    type = "website",
    noindex = false,
}: SeoInput): SeoHead => {
    const url = absoluteUrl(path)

    return {
        meta: [
            { title },
            { name: "description", content: description },
            ...(noindex ? [{ name: "robots", content: "noindex" }] : []),
            { property: "og:title", content: title },
            { property: "og:description", content: description },
            { property: "og:type", content: type },
            { property: "og:url", content: url },
            { property: "og:image", content: absoluteUrl(image) },
            { name: "twitter:card", content: "summary_large_image" },
        ],
        links: noindex ? [] : [{ rel: "canonical", href: url }],
    }
}

/**
 * A tab overrides only what it changes. The parent route already emitted the
 * description, social image and canonical for the profile it belongs to.
 */
export const titleTags = (title: string) => ({
    meta: [
        { title },
        { property: "og:title", content: title },
    ] satisfies SeoMeta[],
})

const pageSuffix = (page: number): string => (page > 1 ? ` — page ${page}` : "")

export const ladderTitle = (
    bracket: Ladder,
    region: Region,
    page = 1,
): string =>
    `Brawlhalla ${regionLabel(region)} ${bracket} rankings${pageSuffix(page)}`

export const powerTitle = (
    gameMode: PowerGameMode,
    region: PowerRegion,
    page = 1,
): string =>
    `Brawlhalla ${region} ${gameMode} power rankings${pageSuffix(page)}`

export const queueTitle = (bracket: Ladder, region: Region): string =>
    `Brawlhalla ${regionLabel(region)} ${bracket} ranked queues`

export const careerPlayersTitle = (page = 1): string =>
    `Brawlhalla career player rankings${pageSuffix(page)}`

const legendName = (legendId: number): string =>
    legendsMap[legendId]?.bio_name ?? `Legend ${legendId}`

export const careerLegendTitle = (legendId: number, page = 1): string =>
    `Brawlhalla career rankings — ${legendName(legendId)}${pageSuffix(page)}`

export const careerWeaponTitle = (weapon: Weapon, page = 1): string =>
    `Brawlhalla career rankings — ${weapon}${pageSuffix(page)}`

export const guildRankingsTitle = (page = 1): string =>
    `Brawlhalla guild rankings${pageSuffix(page)}`

export const playerTitle = (name: string): string =>
    `${name} — Brawlhalla player stats`

export const playerTabTitle = (name: string, tab: string): string =>
    `${name} — ${tab} — Brawlhalla player stats`

export const guildTitle = (name: string): string =>
    `${name} — Brawlhalla guild stats`

const SLUG_NAME = /^\d+-(.+)$/

/**
 * A slug is the name lowercased with spaces turned into hyphens, so title case
 * is the closest readable form of the original.
 */
const slugName = (slug: string): string | undefined => {
    const half = SLUG_NAME.exec(slug)?.[1]

    return half === undefined || half === ""
        ? undefined
        : half
              .replace(/-/g, " ")
              .replace(/\b\w/g, (character) => character.toUpperCase())
}

const profileName = (
    name: string | undefined,
    slug: string,
    noun: string,
): string => name ?? slugName(slug) ?? `${noun} ${parseEntityId(slug) ?? slug}`

export const playerName = (name: string | undefined, slug: string): string =>
    profileName(name, slug, "Player")

export const guildName = (name: string | undefined, slug: string): string =>
    profileName(name, slug, "Guild")

/**
 * A tab route's loader does not refetch the profile: the layout above it already
 * put the display name in the match chain.
 */
export const loadedName = (
    matches: readonly { readonly loaderData?: unknown }[],
): string | undefined => {
    for (const match of matches) {
        const data = match.loaderData as { readonly name?: unknown } | undefined

        if (typeof data?.name === "string" && data.name !== "") return data.name
    }
}
