import { Link } from "@tanstack/react-router"
import { useMediaQuery } from "@/lib/useMediaQuery"
import type { ReactNode } from "react"

/**
 * The one place a link to a player or a clan is rendered.
 *
 * Every entity link in the app goes through this component, which is what keeps
 * the interaction rules from drifting apart across call sites. Three behaviours
 * will hang off it, and all three are decided here rather than at each link:
 *
 * - **Desktop opens an overlay, mobile navigates.** The profile panel preserves
 *   context on a large screen; on a phone the native back gesture already costs
 *   nothing, so an overlay would only add a dismiss affordance. Gated on a
 *   precise pointer, so a touch device never gets the overlay path.
 * - **Hover cards.** A pointer-fine device prefetches the destination on
 *   hover-intent, so the panel opens from warm data.
 * - **Modified clicks fall through.** ⌘/Ctrl/middle-click must behave like a
 *   normal link — the browser's own new-tab path — which is why this renders a
 *   real anchor rather than intercepting on a div.
 *
 * Today it only navigates: the overlay and the hover card are additive changes
 * in this file, and no call site needs to know when they land.
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
    // Reserved for the overlay/hover behaviour; read now so the media-query
    // decision has exactly one home and cannot be re-derived inconsistently.
    const pointerFine = useMediaQuery("(hover: hover) and (pointer: fine)")

    return (
        <Link
            to={href}
            data-entity-type={type}
            data-entity-id={id}
            data-pointer-fine={pointerFine ? "true" : "false"}
            className={className}
        >
            {children}
        </Link>
    )
}
