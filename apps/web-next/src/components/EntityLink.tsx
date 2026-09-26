import { useAtomSet } from "@effect/atom-react"
import { Link } from "@tanstack/react-router"
import { useCallback } from "react"
import type { MouseEvent, ReactNode } from "react"
import { hoveredAtom } from "@/effect/hover"
import { useHasPointer } from "@/lib/pointer"

/**
 * The one place a link to a player or a clan is rendered.
 *
 * Every entity link goes through here so the interaction is decided once rather
 * than per call site. The link itself stays a real anchor, which is why
 * middle-click, "copy link", keyboard activation and modified clicks all behave
 * correctly for free — the hover preview is added *around* that, never in place
 * of it.
 *
 * The hover behaviour is a one-line consequence of the seam: raise the pointer's
 * target in an atom and let `HoverPreviewLayer` decide what to do about it. The
 * delay lives in that atom (see `effect/hover.ts`), not here, so this component
 * has no timers and nothing to clean up.
 */
export type EntityLinkProps = {
    readonly type: "player" | "clan"
    readonly id: number | string
    readonly href: string
    readonly children: ReactNode
    readonly className?: string
}

export const EntityLink = ({
    type,
    id,
    href,
    children,
    className,
}: EntityLinkProps) => {
    const setHovered = useAtomSet(hoveredAtom)
    const hasPointer = useHasPointer()

    const onMouseEnter = useCallback(
        (event: MouseEvent<HTMLAnchorElement>) => {
            // A coarse pointer synthesises `mouseenter` on tap, which would open
            // a preview a touch user can never dismiss. Nothing here is load
            // bearing for touch: the link navigates on its own.
            if (!hasPointer) return

            const rect = event.currentTarget.getBoundingClientRect()

            setHovered({
                type,
                id: String(id),
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            })
        },
        [hasPointer, setHovered, type, id],
    )

    const onMouseLeave = useCallback(() => {
        if (!hasPointer) return

        setHovered(null)
    }, [hasPointer, setHovered])

    return (
        <Link
            to={href}
            data-entity-type={type}
            data-entity-id={id}
            className={className}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {children}
        </Link>
    )
}
