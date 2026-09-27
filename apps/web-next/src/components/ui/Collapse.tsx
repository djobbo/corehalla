import { cn } from "@/lib/cn"
import { useState } from "react"
import type { ReactNode } from "react"

/**
 * A disclosure panel.
 *
 * Built on `<details>`/`<summary>` rather than a JS disclosure library: it is
 * keyboard accessible and open-by-default-searchable for free, and the player
 * page needs dozens of these (one per legend, one per weapon) where a mounted
 * component each would be wasted work.
 *
 * `open` is driven from state rather than left uncontrolled so React re-renders
 * cannot fight the browser over the attribute. The body is mounted only while
 * open: the legends and weapons tabs render one of these per row, so keeping
 * every closed body in the DOM would mean hundreds of hidden stat grids.
 */
export const Collapse = ({
    summary,
    children,
    defaultOpen = false,
    className,
}: {
    readonly summary: ReactNode
    readonly children: ReactNode
    readonly defaultOpen?: boolean
    readonly className?: string
}) => {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <details
            className={cn("ch-collapse", className)}
            open={open}
            onToggle={(event) => setOpen(event.currentTarget.open)}
        >
            <summary>{summary}</summary>
            {open && <div className="ch-collapse-body">{children}</div>}
        </details>
    )
}
