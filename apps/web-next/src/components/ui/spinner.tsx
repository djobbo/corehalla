import { cn } from "cn"
import { Loader2Icon } from "lucide-react"

/*
 * The root is `<output>`, not `<svg role="status">`. `output` already carries
 * the `status` live-region role, so the same semantics come from the element
 * instead of an ARIA attribute, and the animated box is an element that can also
 * hold the label. The icon inside is decorative.
 */
function Spinner({ className, ...props }: React.ComponentProps<"output">) {
    return (
        <output
            data-slot="spinner"
            aria-label="Loading"
            className={cn("inline-flex size-4 animate-spin", className)}
            {...props}
        >
            <Loader2Icon aria-hidden className="size-full" />
        </output>
    )
}

export { Spinner }
