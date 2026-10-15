import { NEWS_PAGE_SIZE } from "@crh/api-contract/schemas"
import type { BHArticle } from "@crh/api-contract/schemas"

export { NEWS_PAGE_SIZE }

/**
 * Curated tab set. The route accepts any category slug; these are only the ones
 * that are stable enough to advertise (the WP taxonomy's top terms).
 */
export const newsCategories: readonly {
    readonly slug: string
    readonly label: string
}[] = [
    { slug: "", label: "All" },
    { slug: "patch-notes", label: "Patch Notes" },
    { slug: "announcements", label: "Announcements" },
    { slug: "esports", label: "Esports" },
    { slug: "community", label: "Community" },
    { slug: "legends", label: "Legends" },
]

const titleCase = (slug: string): string =>
    slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

export const newsCategoryLabel = (slug: string): string =>
    newsCategories.find((entry) => entry.slug === slug)?.label ??
    titleCase(slug)

/** `""` is the all-categories feed; only its pages live under `/news/page`. */
export const newsHref = (category: string, page = 1): string => {
    if (category === "") {
        return page > 1 ? `/news/page/${page}` : "/news"
    }

    const base = `/news/category/${category}`

    return page > 1 ? `${base}/${page}` : base
}

export const articleHref = (slug: string): string => `/news/${slug}`

type ImageSize = BHArticle["featuredImage"]["mediaDetails"]["sizes"][number]

/** First matching WP size name, falling back to the full-size original. */
const preferredImage = (
    article: BHArticle,
    names: readonly string[],
): string => {
    const sizes = article.featuredImage.mediaDetails.sizes

    for (const name of names) {
        const match = sizes.find((size: ImageSize) => size.name === name)

        if (match) return match.sourceUrl
    }

    return article.featuredImage.sourceUrl
}

export const articleCardImage = (article: BHArticle): string =>
    preferredImage(article, ["medium_large", "large", "medium"])

export const articleHeroImage = (article: BHArticle): string =>
    preferredImage(article, ["large", "medium_large", "1536x1536"])

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
})

/** WP `dateGmt` omits the zone suffix; it is UTC by contract. */
export const formatArticleDate = (dateGmt: string): string => {
    const iso = /(?:z|[+-]\d\d:?\d\d)$/i.test(dateGmt) ? dateGmt : `${dateGmt}Z`
    const date = new Date(iso)

    return Number.isNaN(date.getTime()) ? dateGmt : dateFormatter.format(date)
}

export const articleDateTime = (dateGmt: string): string =>
    /(?:z|[+-]\d\d:?\d\d)$/i.test(dateGmt) ? dateGmt : `${dateGmt}Z`
