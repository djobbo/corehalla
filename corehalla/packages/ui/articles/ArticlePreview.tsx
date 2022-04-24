import Image from "next/image"
import type { BHArticle } from "web-parser/bh-articles/parseBHArticlesPage"

type ArticlePreviewProps = {
    article: BHArticle
}

export const ArticlePreview = ({ article }: ArticlePreviewProps) => {
    const { title, thumb, href } = article

    return (
        <div className="flex flex-col">
            <a
                className="relative w-full aspect-video rounded-lg overflow-hidden"
                href={href}
                target="_blank"
                rel="noreferrer"
            >
                <Image
                    src={thumb.src}
                    alt={title}
                    layout="fill"
                    objectFit="cover"
                    objectPosition="center"
                />
            </a>
            <h4 className="mt-4 font-bold">
                <a href={href} target="_blank" rel="noreferrer">
                    {title}
                </a>
            </h4>
        </div>
    )
}
