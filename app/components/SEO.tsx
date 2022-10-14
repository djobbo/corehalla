import { cleanString } from "common/helpers/cleanString"
import Head from "next/head"

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
    const metaTags = [
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
        { name: "twitter:card", content: "summary_large_image" },
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

    return metaTags
}

export const SEO = (props: SEOProps) => {
    const { title, description, image } = props

    const cleanTitle = cleanString(title)
    const cleanDescription = cleanString(description ?? "")

    return (
        <Head>
            <title>{cleanTitle}</title>
            <meta name="description" content={cleanDescription} />
            <meta itemProp="name" content={cleanTitle} />
            <meta itemProp="description" content={cleanDescription} />
            <meta itemProp="image" content={image} />
            {getSocialTags(props).map(({ name, content }) => {
                return content ? (
                    <meta key={name} name={name} content={content} />
                ) : null
            })}
        </Head>
    )
}
