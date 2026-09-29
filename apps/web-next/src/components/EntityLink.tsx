import { Link } from "@tanstack/react-router"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { EntityPreview } from "@/components/HoverPreview"
import { cn } from "@/lib/cn"
import { useHasPointer } from "@/lib/pointer"
import type { ReactNode } from "react"

/**
 * How long the pointer must rest on a link before the preview opens.
 *
 * Matched to the value this app used before the preview became a `HoverCard`
 * (the `120 millis` debounce on the old hover atom), because it is the setting
 * the interaction was tuned around: long enough that sweeping across a ladder
 * fires nothing, short enough that a deliberate hover feels immediate. Base UI's
 * own default is 600ms, which is tuned for documentation prose rather than a
 * table of fifty rows.
 */
const HOVER_DELAY_MS = 120

/**
 * The one place a link to a player or a clan is rendered.
 *
 * Every entity link goes through here so the interaction is decided once rather
 * than per call site. The link itself stays a real anchor, which is why
 * middle-click, "copy link", keyboard activation and modified clicks all behave
 * correctly for free — the hover preview is added *around* that, never in place
 * of it.
 *
 * The preview is shadcn's `HoverCard` (Base UI's `PreviewCard`), which is what
 * now owns the parts this component used to hand to an atom and a shared layer:
 * the open delay, the grace period that lets the pointer travel from the link
 * into the card without it vanishing, dismissal on Escape and on leaving, and
 * the `aria-expanded`/`role` wiring. `PreviewCard.Trigger` renders an anchor by
 * default, so the trigger *is* the link rather than a button imitating one.
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
    const hasPointer = useHasPointer()

    /*
     * The link treatment — it inherits the row's foreground and warms to the
     * focus blue on hover — belongs here rather than at every call site, for the
     * same reason the component exists at all: it is one component so the
     * interaction is decided once. It replaced the retired bespoke link class,
     * whose colour transition is now the `hover:text-ring` pair.
     */
    const linkClass = cn("transition-colors hover:text-ring", className)

    /*
     * A coarse pointer synthesises `mouseenter` on tap, which would open a
     * preview a touch user can never dismiss. Nothing here is load-bearing for
     * touch — the link navigates on its own — so on touch this stays a plain
     * anchor with no card behind it.
     */
    if (!hasPointer) {
        return (
            <Link
                to={href}
                data-entity-type={type}
                data-entity-id={id}
                className={linkClass}
            >
                {children}
            </Link>
        )
    }

    return (
        <HoverCard>
            <HoverCardTrigger
                delay={HOVER_DELAY_MS}
                render={
                    <Link
                        to={href}
                        data-entity-type={type}
                        data-entity-id={id}
                        className={linkClass}
                    />
                }
            >
                {children}
            </HoverCardTrigger>

            {/*
             * `empty:hidden` is what keeps "nothing to show" from becoming an
             * empty slab under the pointer. The preview renders nothing until it
             * has real data to show — a failed request, an id with no record, or
             * simply a fetch still in flight — which leaves the popup with no
             * children at all, and a popup with no children is hidden instead of
             * being drawn as a bare panel. Hovering was never how anyone
             * navigates, so silence remains the correct failure mode.
             */}
            <HoverCardContent className="w-[300px] p-3 empty:hidden">
                <EntityPreview type={type} id={String(id)} />
            </HoverCardContent>
        </HoverCard>
    )
}
