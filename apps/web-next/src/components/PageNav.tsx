import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"

/**
 * Previous/next controls for a paged list.
 *
 * Extracted once a third list needed them. The ladder, the global leaderboards
 * and the clan rankings are all "one page of many", and three hand-written
 * copies of the same two buttons would eventually disagree about which end
 * disappears when — or about whether the first page offers a "previous" at all.
 *
 * Each control is a real link rather than a button with a handler, so a page of
 * a ranking stays shareable, middle-clickable and back-buttonable. That is why
 * this is `Button` with `render` rather than `PaginationLink`: `Pagination` is
 * for a numbered page list, and these are two directional controls that come and
 * go. `nativeButton={false}` is required whenever `render` swaps the button
 * element for an anchor, or Base UI keeps button semantics that the element no
 * longer has.
 *
 * `undefined` means the end is not reachable, which is also how the caller says
 * "there is nothing that way" without the component having to know about page
 * counts.
 */
export const PageNav = ({
    prevHref,
    nextHref,
}: {
    readonly prevHref?: string | undefined
    readonly nextHref?: string | undefined
}) => (
    <div className="mt-4 flex gap-2">
        {prevHref === undefined ? null : (
            <Button
                variant="default"
                nativeButton={false}
                render={<Link to={prevHref} />}
            >
                <ChevronLeftIcon data-icon="inline-start" />
                Previous
            </Button>
        )}
        {nextHref === undefined ? null : (
            <Button
                variant="default"
                nativeButton={false}
                render={<Link to={nextHref} />}
            >
                Next
                <ChevronRightIcon data-icon="inline-end" />
            </Button>
        )}
    </div>
)
