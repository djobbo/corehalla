import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty"

export const FavoritesEmpty = ({
    className,
    action,
}: {
    readonly className?: string
    readonly action?: React.ReactNode
}) => (
    <Empty className={className}>
        <EmptyHeader>
            <EmptyTitle>No favorites yet</EmptyTitle>
            <EmptyDescription>
                Open a player or clan and press &ldquo;Favorite&rdquo;.
            </EmptyDescription>
        </EmptyHeader>
        {action === undefined ? null : <EmptyContent>{action}</EmptyContent>}
    </Empty>
)
