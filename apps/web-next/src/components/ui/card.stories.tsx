import type { Meta, StoryObj } from "@storybook/react-vite"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./card"
import { Button } from "./button"

const meta = {
    title: "Components/Card",
    component: Card,
    parameters: { layout: "centered" },
    argTypes: {
        size: { control: "inline-radio", options: ["default", "sm"] },
    },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: (args) => (
        <Card {...args} className="w-80">
            <CardHeader>
                <CardTitle>Season 12</CardTitle>
                <CardDescription>
                    Ranked season summary across every bracket.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                Diamond II · 1,842 rating · 214 games played.
            </CardContent>
            <CardFooter>
                <Button size="sm">View ladder</Button>
            </CardFooter>
        </Card>
    ),
}

export const WithAction: Story = {
    render: () => (
        <Card className="w-80">
            <CardHeader>
                <CardTitle>Top legend</CardTitle>
                <CardDescription>
                    Most games in the last 30 days.
                </CardDescription>
                <CardAction>
                    <Button variant="ghost" size="icon-sm" aria-label="Actions">
                        ⋯
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                Mordex · 412 games · 58% win rate.
            </CardContent>
        </Card>
    ),
}

export const Small: Story = {
    args: { size: "sm" },
    render: (args) => (
        <Card {...args} className="w-64">
            <CardHeader>
                <CardTitle>Compact</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">Tighter padding.</CardContent>
        </Card>
    ),
}
