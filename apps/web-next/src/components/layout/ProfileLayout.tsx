import type { ReactNode } from "react"

/*
 * The profile pages (player and guild) stack their identity header above the
 * content in a single column, at every width.
 *
 * The content is its own query container: the card grids and panels inside size
 * against the page column rather than the window. `.ch-page`'s 72rem is the
 * width every other route already runs at.
 */
export const ProfileLayout = ({
    aside,
    children,
}: {
    readonly aside: ReactNode
    readonly children: ReactNode
}) => (
    <main className="ch-page">
        <div className="flex flex-col gap-4">
            <div className="min-w-0">{aside}</div>
            <div className="@container flex min-w-0 flex-col">{children}</div>
        </div>
    </main>
)
