import type { Meta, StoryObj } from "@storybook/react-vite"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "./button"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "./collapsible"

const meta = {
    title: "Components/Collapsible",
    component: Collapsible,
    parameters: { layout: "centered" },
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

const Panel = () => (
    <CollapsibleContent>
        <div className="flex flex-col gap-1 pt-3 text-sm text-muted-foreground">
            <span>Ranked · 125 wins</span>
            <span>Casual · 40 wins</span>
            <span>Customs · 12 wins</span>
        </div>
    </CollapsibleContent>
)

export const Default: Story = {
    render: ({ ...args }) => (
        <Collapsible {...args} className="w-72">
            <CollapsibleTrigger
                render={
                    <Button
                        variant="outline"
                        className="w-full justify-between"
                    />
                }
            >
                Match history
                <ChevronDownIcon />
            </CollapsibleTrigger>
            <Panel />
        </Collapsible>
    ),
}

export const Open: Story = {
    render: ({ ...args }) => (
        <Collapsible {...args} defaultOpen className="w-72">
            <CollapsibleTrigger
                render={
                    <Button
                        variant="outline"
                        className="w-full justify-between"
                    />
                }
            >
                Match history
                <ChevronDownIcon />
            </CollapsibleTrigger>
            <Panel />
        </Collapsible>
    ),
}
