import type { ReactNode } from "react"

/*
 * The profile pages (player and guild) are the only routes with a second
 * column: identity on the left, everything else on the right.
 *
 * `.ch-page`'s 72rem is what the content column gets on its own, so the wider
 * cap is what keeps that column from shrinking once the aside takes 20rem of
 * it. Below `lg` the grid collapses to source order, which is the stacked
 * mobile layout both headers were designed against.
 */
export const ProfileLayout = ({
    aside,
    children,
}: {
    readonly aside: ReactNode
    readonly children: ReactNode
}) => (
    <main className="ch-page max-w-[84rem]">
        <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-8">
            {/* `self-start` gives the pinned column somewhere to travel. */}
            <div className="min-w-0 lg:sticky lg:top-[calc(var(--ch-header-h)_+_1rem)] lg:self-start">
                {aside}
            </div>
            {/*
             * The query container for everything on the right: at `lg` this
             * column is far narrower than the viewport, so content inside it has
             * to size against the column rather than the window.
             */}
            <div className="@container flex min-w-0 flex-col">{children}</div>
        </div>
    </main>
)
