import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"

/**
 * The one place a link to a player or a clan is rendered.
 *
 * Every entity link goes through here so the interaction is decided once rather
 * than per call site. Today that interaction is a plain navigation: the link
 * renders a real anchor, which is why middle-click, "copy link" and keyboard
 * activation all behave correctly for free.
 *
 * It exists as a seam. Hover previews — prefetching the destination on
 * hover-intent — belong here, and should not require touching a call site. The
 * panel was built and then set aside: reconstructing the page behind it turned
 * out to cost more than it returned, and a plain page navigation is the honest
 * default.
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
}: EntityLinkProps) => (
    <Link
        to={href}
        data-entity-type={type}
        data-entity-id={id}
        className={className}
    >
        {children}
    </Link>
)
