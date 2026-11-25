import { cn } from "cn"

function Empty({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="empty"
            className={cn(
                "flex w-full min-w-0 flex-1 flex-col items-start gap-3 p-6 text-left text-balance",
                className,
            )}
            {...props}
        />
    )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="empty-header"
            className={cn(
                "flex max-w-md flex-col items-start gap-1.5",
                className,
            )}
            {...props}
        />
    )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="empty-title"
            className={cn("ch-kicker", className)}
            {...props}
        />
    )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
    return (
        <div
            data-slot="empty-description"
            className={cn(
                "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
                className,
            )}
            {...props}
        />
    )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="empty-content"
            className={cn(
                "flex w-full max-w-md min-w-0 flex-col items-start gap-3 text-sm text-balance",
                className,
            )}
            {...props}
        />
    )
}

export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent }
