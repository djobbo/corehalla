import { type BHArticle } from "web-parser/common"
import { Image } from "@components/Image"

type ArticlePreviewProps = {
    article: BHArticle
}

const BASE_BRAWLHALLA_ARTICLE_URL = "https://brawlhalla.com/news/"

export const ArticlePreview = ({ article }: ArticlePreviewProps) => {
    const { title, featuredImage, categories } = article

    const href = `${BASE_BRAWLHALLA_ARTICLE_URL}${article.slug}`

    return (
        <div className="flex flex-col">
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
            <div className="flex justify-start items-center gap-2 mt-2">
                {categories.map((category) => (
                    <span
                        key={category.slug}
                        className="px-2 py-1 text-xs rounded-md bg-bgVar2 text-textVar1"
                    >
                        {category.name}
                    </span>
                ))}
            </div>
            <h4 className="mt-4 font-bold">
                <a href={href} target="_blank" rel="noreferrer">
                    {title}
                </a>
            </h4>
        </div>
    )
}
