import { Link } from "@tanstack/react-router"
import { LadderTable } from "@/components/common/LadderTable"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import { ladderHref } from "@/lib/rankings"
import type { Bracket } from "@/lib/rankings"
import type { LadderRow } from "@/lib/ladderRows"

const PREVIEW_ROWS = 5

export const LandingLadder = ({
    bracket,
    rows,
}: {
    readonly bracket: Bracket
    readonly rows: readonly LadderRow[]
}) => {
    const preview = rows.slice(0, PREVIEW_ROWS)
    const hasMore = rows.length > preview.length

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="ch-display text-lg">{bracket}</h2>
            </div>
            {preview.length === 0 ? (
                <Empty className="flex-none bg-card py-6">
                    <EmptyHeader>
                        <EmptyDescription className="text-xs">
                            The {bracket} ladder could not be read right now.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <LadderTable rows={preview} />
            )}

            {hasMore ? (
                <Button
                    variant="default"
                    nativeButton={false}
                    render={<Link to={ladderHref(bracket, "all")} />}

                    aria-label={`Load more ${bracket} rankings`}
                    className="mt-auto w-full"
                >
                    Load more
                </Button>
            ) : null}
        </div>
    )
}
