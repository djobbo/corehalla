import { Link } from "@tanstack/react-router"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { EntityPreview } from "@/components/common/HoverPreview"
import { cn } from "@/lib/cn"
import { useHasPointer } from "@/lib/pointer"
import type { ReactNode } from "react"

const HOVER_DELAY_MS = 120

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

    const linkClass = cn("transition-colors hover:text-ring", className)

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
            <HoverCardContent className="w-[300px] p-3 empty:hidden">
                <EntityPreview type={type} id={String(id)} />
            </HoverCardContent>
        </HoverCard>
    )
}
