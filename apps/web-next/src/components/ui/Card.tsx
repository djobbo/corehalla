import { cn } from "@/lib/cn"
import type { ReactNode } from "react"

/**
 * The one card shape on the player page.
 *
 * The variants are a hierarchy rather than four styles: `default` is a raised
 * slab, `inset` is a recessed well meant to sit *inside* a default card (a stat
 * grid nested in a summary), `muted` is a flat placeholder for a section with
 * nothing to show, and `ghost` has no fill at all — it is the layout of a card
 * (padding plus a container query) with the page showing straight through it.
 *
 * Every card is a container-query context, so the grids inside it respond to the
 * card's own width rather than the viewport — which is what keeps a stat grid
 * readable in a 1/3-width column and a full-width one alike.
 */
export type CardVariant = "default" | "inset" | "muted" | "ghost"

export type CardProps = {
    readonly variant?: CardVariant
    readonly title?: ReactNode
    readonly className?: string
    readonly bodyClassName?: string
    readonly children: ReactNode
}

const variantClass: Record<CardVariant, string> = {
    default: "ch-panel",
    inset: "ch-card-inset",
    muted: "ch-card-muted",
    ghost: "",
}

export const Card = ({
    variant = "default",
    title,
    className,
    bodyClassName,
    children,
}: CardProps) => (
    <div className={cn("@container p-4", variantClass[variant], className)}>
        {title !== undefined && <h3 className="ch-card-title">{title}</h3>}
        <div className={cn(title !== undefined && "mt-3", bodyClassName)}>
            {children}
        </div>
    </div>
)
