import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/cn"
import {
    articleCardImage,
    articleDateTime,
    articleHeroImage,
    articleHref,
    formatArticleDate,
    newsHref,
} from "@/lib/news"
import type { BHArticle } from "@crh/api-contract/schemas"

type NewsCardProps = {
    readonly article: BHArticle
    readonly variant?: "default" | "featured" | "compact"
    readonly className?: string
}

const CategoryChips = ({ article }: { readonly article: BHArticle }) =>
    article.categories.length === 0 ? null : (
        <div className="flex flex-wrap items-center gap-1.5">
            {article.categories.map((category) => (
                <Link
                    key={category.slug}
                    to={newsHref(category.slug)}
                    className="ch-chip ch-chip-off text-[0.58rem]"
                >
                    {category.name}
                </Link>
            ))}
        </div>
    )

const Meta = ({ article }: { readonly article: BHArticle }) => (
    <div className="flex flex-wrap items-center justify-between gap-2">
        <time
            dateTime={articleDateTime(article.dateGmt)}
            className="text-[0.68rem] font-bold tracking-[0.12em] text-muted-foreground uppercase"
        >
            {formatArticleDate(article.dateGmt)}
        </time>
        <CategoryChips article={article} />
    </div>
)

export const NewsCard = ({
    article,
    variant = "default",
    className,
}: NewsCardProps) => {
    if (variant === "compact") {
        return (
            <div className={cn("flex items-start gap-4", className)}>
                <Link
                    to={articleHref(article.slug)}
                    className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-card sm:w-40"
                >
                    <img
                        src={articleCardImage(article)}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover object-center"
                    />
                </Link>
                <div className="flex min-w-0 flex-col gap-2">
                    <h3 className="text-sm leading-snug font-bold">
                        <Link
                            to={articleHref(article.slug)}
                            className="transition-colors hover:text-ring"
                        >
                            {article.title}
                        </Link>
                    </h3>
                    <CategoryChips article={article} />
                </div>
            </div>
        )
    }

    const featured = variant === "featured"

    return (
        <article className={cn("flex flex-col gap-3", className)}>
            <Link
                to={articleHref(article.slug)}
                className="relative aspect-video overflow-hidden rounded-2xl bg-card"
            >
                <img
                    src={
                        featured
                            ? articleHeroImage(article)
                            : articleCardImage(article)
                    }
                    alt=""
                    loading="lazy"
                    className="size-full object-cover object-center"
                />
            </Link>
            <Meta article={article} />
            <h2
                className={cn(
                    "font-bold leading-snug",
                    featured ? "text-xl lg:text-2xl" : "text-base",
                )}
            >
                <Link
                    to={articleHref(article.slug)}
                    className="transition-colors hover:text-ring"
                >
                    {article.title}
                </Link>
            </h2>
            {featured && article.excerpt ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {article.excerpt}
                </p>
            ) : null}
        </article>
    )
}

/** Page-1 lead article: full-bleed image with the title laid over it. */
export const NewsHero = ({ article }: { readonly article: BHArticle }) => (
    <Link
        to={articleHref(article.slug)}
        className="group relative block aspect-[2/1] overflow-hidden rounded-2xl bg-card md:aspect-[3/1]"
    >
        <img
            src={articleHeroImage(article)}
            alt=""
            className="size-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 flex flex-col justify-end gap-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
                <time
                    dateTime={articleDateTime(article.dateGmt)}
                    className="text-[0.68rem] font-bold tracking-[0.12em] text-white/80 uppercase"
                >
                    {formatArticleDate(article.dateGmt)}
                </time>
                {article.categories.slice(0, 2).map((category) => (
                    <span
                        key={category.slug}
                        className="ch-chip ch-chip-on text-[0.58rem]"
                    >
                        {category.name}
                    </span>
                ))}
            </div>
            <h2 className="ch-display max-w-4xl text-xl text-white md:text-3xl">
                {article.title}
            </h2>
        </div>
    </Link>
)
