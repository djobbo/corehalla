import { cleanString } from "common/helpers/cleanString"

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

/**
 * Builds the document head entries for a page.
 *
 * In the Next.js app this was a `<SEO>` component rendered inside pages. In
 * TanStack Start, document head is owned by the route, so this is now a pure
 * helper that route `head()` functions call. It produces exactly the same tags
 * as the previous component: title, description, itemprop tags, Twitter card,
 * and Open Graph tags.
 */
export const seoTags = (props: SEOProps) => {
    const {
        title,
        description,
        image = DEFAULT_OG_IMAGE,
        url,
        createdAt,
        updatedAt,
        openGraphType,
        settings,
    } = props

    const cleanTitle = cleanString(title)
    const cleanDescription = cleanString(description ?? "")

    const socialTags: { name: string; content: string | undefined }[] = [
        { name: "twitter:card", content: "summary_large_image" },
        {
            name: "twitter:site",
            content: settings?.meta?.social?.twitter?.site ?? "@Corehalla",
        },
        { name: "twitter:title", content: cleanTitle },
        { name: "twitter:description", content: cleanDescription },
        {
            name: "twitter:creator",
            content: settings?.meta?.social?.twitter?.author ?? "@djobbo_",
        },
        { name: "twitter:image:src", content: image },
        { name: "og:title", content: cleanTitle },
        { name: "og:type", content: openGraphType },
        { name: "og:url", content: url },
        { name: "og:image", content: image },
        { name: "og:description", content: cleanDescription },
        { name: "og:site_name", content: settings?.meta?.title ?? cleanTitle },
        {
            name: "og:published_time",
            content: (createdAt ?? new Date()).toISOString(),
        },
        {
            name: "og:modified_time",
            content: (updatedAt ?? new Date()).toISOString(),
        },
    ]

    return [
        { title: cleanTitle },
        { name: "description", content: cleanDescription },
        { itemProp: "name", content: cleanTitle },
        { itemProp: "description", content: cleanDescription },
        { itemProp: "image", content: image },
        ...socialTags
            .filter((tag) => !!tag.content)
            .map((tag) => ({ name: tag.name, content: tag.content as string })),
    ]
}

export const seoLinks = (canonical?: string) =>
    canonical ? [{ rel: "canonical", href: canonical }] : []
