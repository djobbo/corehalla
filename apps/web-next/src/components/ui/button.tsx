import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
    "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-semibold tracking-[-0.011em] whitespace-nowrap transition-[background-color,color,border-color] duration-[120ms] ease-[ease] select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    {
        variants: {
            variant: {
                /* One ink action. The slanted pieces carry the accent, not the button. */
                default: "bg-ink text-white hover:bg-foreground",
                secondary:
                    "border-border bg-card text-foreground hover:bg-bgVar2",
                outline:
                    "border-border bg-card text-foreground hover:bg-bgVar2 aria-expanded:bg-bgVar2",
                ghost: "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground",
                destructive: "bg-destructive text-ink hover:bg-destructive/90",
                link: "text-brandDeep underline underline-offset-4 hover:underline",
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
