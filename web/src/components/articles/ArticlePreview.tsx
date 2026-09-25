import { type BHArticle } from "web-parser/common"
import { Image } from "@components/Image"
import { cn } from "common/helpers/classnames"

type ArticlePreviewProps = {
    article: BHArticle
    /**
     * `featured` is the large lead story; `compact` is the small horizontal
     * card used in the side column. Defaults to the original vertical card.
     */
    variant?: "default" | "featured" | "compact"
    className?: string
}

const BASE_BRAWLHALLA_ARTICLE_URL = "https://brawlhalla.com/news/"

export const ArticlePreview = ({
    article,
    variant = "default",
    className,
}: ArticlePreviewProps) => {
    const { title, featuredImage, categories } = article

    const href = `${BASE_BRAWLHALLA_ARTICLE_URL}${article.slug}`

    const categoryList = categories.length > 0 && (
        <div className="flex flex-wrap justify-start items-center gap-2">
            {categories.map((category) => (
                <span
                    key={category.slug}
                    className="px-2 py-1 text-xs rounded-md bg-bgVar2 text-textVar1"
                >
                    {category.name}
                </span>
            ))}
        </div>
    )

    if (variant === "compact") {
        return (
            <div className={cn("flex items-start gap-4", className)}>
                <a
                    className="relative w-32 shrink-0 aspect-video rounded-lg overflow-hidden sm:w-40"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                >
                    <Image
                        src={featuredImage.sourceUrl}
                        alt={title}
                        className="object-cover object-center"
                        Container={null}
                        unoptimized
                    />
                </a>
                <div className="flex flex-col min-w-0">
                    {categoryList}
                    <h4 className="mt-2 text-sm font-bold leading-snug">
                        <a href={href} target="_blank" rel="noreferrer">
                            {title}
                        </a>
                    </h4>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col", className)}>
            <a
                className="relative w-full aspect-video rounded-lg overflow-hidden"
                href={href}
                target="_blank"
                rel="noreferrer"
            >
                <Image
                    src={featuredImage.sourceUrl}
                    alt={title}
                    className="object-cover object-center"
                    Container={null}
                    unoptimized
                />
            </a>
            <div className="mt-2">{categoryList}</div>
            <h4
                className={cn("mt-4 font-bold", {
                    "text-xl lg:text-2xl": variant === "featured",
                })}
            >
                <a href={href} target="_blank" rel="noreferrer">
                    {title}
                </a>
            </h4>
        </div>
    )
}
