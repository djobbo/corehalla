import { Image } from "@components/Image"
import type { BHArticle } from "web-parser/bh-articles/parseBHArticlesPage"

type ArticlePreviewProps = {
    article: BHArticle
}

export const ArticlePreview = ({ article }: ArticlePreviewProps) => {
    const { title, thumb, href, tags } = article

    return (
        <div className="flex flex-col">
            <a
                className="relative w-full aspect-video rounded-lg overflow-hidden"
                href={href}
                target="_blank"
                rel="noreferrer"
            >
                <Image
                    src={thumb}
                    alt={title}
                    className="object-cover object-center"
                    Container={null}
                    unoptimized
                />
            </a>
            <div className="flex justify-start items-center gap-2 mt-2">
                {tags.map((tag) => (
                    <span
                        key={tag.type}
                        className="px-2 py-1 text-xs rounded-md bg-bgVar2 text-textVar1"
                    >
                        {tag.label}
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
