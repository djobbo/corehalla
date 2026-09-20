import { cn } from "common/helpers/classnames"
import type { CSSProperties, ImgHTMLAttributes, ReactNode } from "react"

type ImageProps = Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "alt" | "width" | "height"
> & {
    src: string
    alt?: string
    containerClassName?: string
    Container?: "div" | "span" | null
    position?: "absolute" | "relative" | "fixed" | string
    sizes?: string
    /**
     * Accepted for parity with the previous `next/image` call sites. Static
     * assets are served as-is, so there is nothing to optimise.
     */
    unoptimized?: boolean
    priority?: boolean
    fill?: boolean
    style?: CSSProperties
    children?: ReactNode
}

/**
 * `next/image` was replaced with a plain `<img>`.
 *
 * TanStack Start does not ship an image optimizer, so the migration keeps the
 * exact same rendered geometry (`fill` -> absolutely positioned image inside a
 * relative container) and only drops the optimisation step. Behaviour, alt
 * text, dimensions, and cache policy are otherwise unchanged.
 */
export const Image = ({
    containerClassName,
    Container = "div",
    position = "relative",
    sizes = "100vw",
    unoptimized: _unoptimized,
    priority: _priority,
    fill: _fill,
    className,
    src,
    alt,
    ...props
}: ImageProps) => {
    const image = (
        <img
            {...props}
            src={src}
            alt={alt ?? ""}
            sizes={sizes}
            className={cn("absolute inset-0 w-full h-full", className)}
        />
    )

    if (!Container) {
        return image
    }

    return (
        <Container className={cn(position, containerClassName)}>
            {image}
        </Container>
    )
}
