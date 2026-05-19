import { cleanString } from "common/helpers/cleanString"
import { useEffect } from "react"

type SEOProps = {
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

const getSocialTags = ({
    openGraphType,
    url,
    title,
    description,
    image,
    createdAt,
    updatedAt,
    settings,
}: SEOProps) => {
    return [
        { name: "twitter:card", content: "summary_large_image" },
        {
            name: "twitter:site",
            content: settings?.meta?.social?.twitter?.site ?? "@Corehalla",
        },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        {
            name: "twitter:creator",
            content: settings?.meta?.social?.twitter?.author ?? "@djobbo_",
        },
        { name: "twitter:image:src", content: image },
        { name: "og:title", content: title },
        { name: "og:type", content: openGraphType },
        { name: "og:url", content: url },
        { name: "og:image", content: image },
        { name: "og:description", content: description },
        {
            name: "og:site_name",
            content: settings?.meta?.title ?? title,
        },
        {
            name: "og:published_time",
            content: (createdAt ?? new Date()).toISOString(),
        },
        {
            name: "og:modified_time",
            content: (updatedAt ?? new Date()).toISOString(),
        },
    ]
}

const setMeta = (name: string, content: string | undefined) => {
    if (!content || typeof document === "undefined") return

    let element = document.querySelector(
        `meta[name="${name}"]`,
    ) as HTMLMetaElement | null

    if (!element) {
        element = document.createElement("meta")
        element.setAttribute("name", name)
        document.head.appendChild(element)
    }

    element.setAttribute("content", content)
}

export const SEO = (props: SEOProps) => {
    const { title, description, image } = props
    const cleanTitle = cleanString(title)
    const cleanDescription = cleanString(description ?? "")

    useEffect(() => {
        document.title = cleanTitle
        setMeta("description", cleanDescription)
        setMeta("itemprop:name", cleanTitle)
        setMeta("itemprop:description", cleanDescription)
        setMeta("itemprop:image", image)

        for (const { name, content } of getSocialTags(props)) {
            setMeta(name, content)
        }
    }, [cleanTitle, cleanDescription, image, props])

    return null
}
