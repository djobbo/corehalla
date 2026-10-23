import { TooltipProvider } from "@/components/ui/tooltip"
import type { Decorator, Preview } from "@storybook/react-vite"
import "../src/styles/app.css"

/**
 * The app shell every story renders inside.
 *
 * Corehalla's page colour lives on the root element, with `body` left
 * transparent so the landing pattern can show through. Storybook owns that
 * root, so the decorator paints the canvas instead, and provides the same
 * `TooltipProvider` `__root.tsx` does — without it, any Tooltip or HoverCard
 * story would throw.
 */
const withAppShell: Decorator = (Story) => (
    <TooltipProvider>
        <div className="min-h-svh bg-background p-6 font-sans text-foreground">
            <Story />
        </div>
    </TooltipProvider>
)

const preview: Preview = {
    decorators: [withAppShell],
    parameters: {
        layout: "fullscreen",
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        // The sidebar order is the taxonomy: Foundations, then the shadcn
        // primitives, then the compositions built from them. Anything
        // untagged sorts last so a missed `title` is obvious.
        options: {
            storySort: {
                order: [
                    "Foundations",
                    "Components",
                    "Patterns",
                    "Features",
                    "Views",
                    "*",
                ],
            },
        },
        a11y: { test: "todo" },
    },
    tags: ["autodocs"],
}

export default preview
