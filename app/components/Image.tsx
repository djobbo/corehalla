import { cn } from "common/helpers/classnames"
import type { ImgHTMLAttributes } from "react"

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
    containerClassName?: string
    Container?: "div" | "span" | null
    position?: "absolute" | "relative" | "fixed" | string
    fill?: boolean
    unoptimized?: boolean
}

export const Image = ({
    containerClassName,
    Container = "div",
    position = "relative",
    fill,
    className,
    alt = "",
    ...props
}: ImageProps) => {
    const img = (
        <img
            {...props}
            alt={alt}
            className={cn(
                fill && "absolute inset-0 h-full w-full",
                className,
            )}
        />
    )

    if (!Container) {
        return img
    }

    return (
        <Container className={cn(position, containerClassName)}>{img}</Container>
    )
}
