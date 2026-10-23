import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
    "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding text-xs font-semibold tracking-widest whitespace-nowrap uppercase transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    {
        variants: {
            variant: {
                /*
                 * The poster's slab: a solid fill that lifts on hover and slams down on
                 * press, with the hard offset shadow doing the lifting. `shadow-sm` here
                 * is Corehalla's unblurred step from `styles/app.css`, and the press
                 * drops the shadow entirely so the button reads as flat against the page
                 * for the moment it is held.
                 */
                default:
                    "bg-card text-foreground shadow-sm hover:-translate-x-px hover:-translate-y-px hover:bg-primary hover:text-primary-foreground active:not-aria-[haspopup]:translate-x-[3px] active:not-aria-[haspopup]:translate-y-[3px] active:not-aria-[haspopup]:shadow-none",
                /* The same slab on the deeper surface, for a quieter second action. */
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:-translate-x-px hover:-translate-y-px hover:bg-card hover:text-foreground active:not-aria-[haspopup]:translate-x-[3px] active:not-aria-[haspopup]:translate-y-[3px] active:not-aria-[haspopup]:shadow-none",
                /* A slab with no fill: the shape is still there to press. */
                outline:
                    "bg-transparent text-foreground shadow-sm hover:bg-card hover:text-foreground aria-expanded:bg-card",
                ghost: "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground",
                destructive:
                    "bg-destructive text-ink shadow-sm hover:-translate-x-px hover:-translate-y-px active:not-aria-[haspopup]:translate-x-[3px] active:not-aria-[haspopup]:translate-y-[3px] active:not-aria-[haspopup]:shadow-none",
                link: "text-primary underline underline-offset-4 hover:underline",
            },
            size: {
                default:
                    "h-10 gap-1.5 px-6 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
                xs: "h-7 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
                sm: "h-9 gap-1 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
                lg: "h-11 gap-1.5 px-8 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
                icon: "size-10",
                "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
                "icon-sm": "size-9",
                "icon-lg": "size-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
)

function Button({
    className,
    variant = "default",
    size = "default",
    ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
    return (
        <ButtonPrimitive
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Button, buttonVariants }
