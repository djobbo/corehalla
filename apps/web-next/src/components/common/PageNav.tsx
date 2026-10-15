import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"

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
