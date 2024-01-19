import { cn } from "@/lib/utils"
import NextImage from "next/image"
import type { ImageProps as NextImageProps } from "next/image"

type ImageProps = NextImageProps & {
    containerClassName?: string
    Container?: "div" | "span" | null
    position?: "absolute" | "relative" | "fixed" | string
}

export const Image = ({
    containerClassName,
    Container = "div",
    position = "relative",
    sizes = "100vw",
    ...props
}: ImageProps) => {
    if (!Container) {
        return <NextImage {...props} fill sizes={sizes} />
    }

    return (
        <Container className={cn(position, containerClassName)}>
            <NextImage {...props} fill sizes={sizes} />
        </Container>
    )
}
