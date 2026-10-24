import { cn } from "@/lib/cn"
import type { CmsImage as CmsImageData } from "@crh/api-contract/schemas"

type CmsImageProps = {
    readonly image: CmsImageData
    readonly sizes?: string
    readonly className?: string
    readonly loading?: "eager" | "lazy"
}

/**
 * CMS images carry a `srcSet` built by the API. The CMS Worker's `/api/images`
 * route uses Cloudflare's Images binding (Sharp in local dev) to resize and
 * negotiate AVIF/WebP without shipping `sharp` to Workers.
 */
export const CmsImage = ({
    image,
    sizes,
    className,
    loading = "lazy",
}: CmsImageProps) => (
    <img
        src={image.url}
        srcSet={image.srcSet}
        sizes={sizes}
        alt={image.alt}
        width={image.width ?? undefined}
        height={image.height ?? undefined}
        loading={loading}
        decoding="async"
        className={cn(className)}
    />
)
