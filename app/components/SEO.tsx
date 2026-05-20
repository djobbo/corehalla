import { cleanString } from "common/helpers/cleanString"

export type SeoMeta =
    | { title: string }
    | { name: string; content: string }
    | { property: string; content: string }

export type SEOProps = {
    title: string
    description?: string
    image?: string
    url?: string
    createdAt?: Date
    updatedAt?: Date
    openGraphType?: string
    settings?: {
        meta?: {
            social?: {
                twitter?: {
                    site: string
                    author: string
                }
            }
            title?: string
        }
    }
}

export const DEFAULT_OG_IMAGE = "/images/og/main-og.jpg"

const formatRankingsRegion = (region: string) =>
    region === "all" ? "Global" : region.toUpperCase()

export const seoHead = (props: SEOProps): { meta: SeoMeta[] } => {
    const title = cleanString(props.title)
    const description = cleanString(props.description ?? "")
    const image = props.image
    const twitterSite =
        props.settings?.meta?.social?.twitter?.site ?? "@Corehalla"
    const twitterCreator =
        props.settings?.meta?.social?.twitter?.author ?? "@djobbo_"
    const siteName = props.settings?.meta?.title ?? title

    const meta: SeoMeta[] = [{ title }]

    if (description) {
        meta.push({ name: "description", content: description })
        meta.push({ name: "itemprop:name", content: title })
        meta.push({ name: "itemprop:description", content: description })
    }

    if (image) {
        meta.push({ name: "itemprop:image", content: image })
    }

    meta.push({ name: "twitter:card", content: "summary_large_image" })
    meta.push({ name: "twitter:site", content: twitterSite })
    meta.push({ name: "twitter:title", content: title })

    if (description) {
        meta.push({ name: "twitter:description", content: description })
    }

    meta.push({ name: "twitter:creator", content: twitterCreator })

    if (image) {
        meta.push({ name: "twitter:image", content: image })
    }

    meta.push({ property: "og:title", content: title })

    if (props.openGraphType) {
        meta.push({ property: "og:type", content: props.openGraphType })
    }

    if (props.url) {
        meta.push({ property: "og:url", content: props.url })
    }

    if (image) {
        meta.push({ property: "og:image", content: image })
    }

    if (description) {
        meta.push({ property: "og:description", content: description })
    }

    meta.push({ property: "og:site_name", content: siteName })
    meta.push({
        property: "og:published_time",
        content: (props.createdAt ?? new Date()).toISOString(),
    })
    meta.push({
        property: "og:modified_time",
        content: (props.updatedAt ?? new Date()).toISOString(),
    })

    return { meta }
}

export const rankings1v1Seo = ({
    region = "all",
    page = "1",
    search = "",
}: {
    region?: string
    page?: string
    search?: string
}) => {
    const regionLabel = formatRankingsRegion(region)
    const suffix = search ? ` - ${search}` : ""
    const title = `Brawlhalla ${regionLabel} 1v1 Rankings - Page ${page}${suffix} • Corehalla`

    return seoHead({ title, description: title })
}

export const rankings2v2Seo = ({
    region = "all",
    page = "1",
}: {
    region?: string
    page?: string
}) => {
    const regionLabel = formatRankingsRegion(region)
    const title = `Brawlhalla ${regionLabel} 2v2 Rankings - Page ${page} • Corehalla`

    return seoHead({ title, description: title })
}

export const rankingsClansSeo = ({ page = "1" }: { page?: string }) => {
    const title = `Brawlhalla Clans - Page ${page} • Corehalla`

    return seoHead({ title, description: title })
}

export const rankingsPowerSeo = ({
    region,
    bracket,
}: {
    region: string
    bracket: string
}) => {
    const title = `Brawlhalla ${region.toUpperCase()} ${bracket} Power Rankings • Corehalla`

    return seoHead({ title, description: title })
}
