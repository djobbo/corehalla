import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "./button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./dialog"

const meta = {
    title: "Components/Dialog",
    component: Dialog,
    parameters: { layout: "centered" },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: ({ ...args }) => (
        <Dialog {...args}>
            <DialogTrigger render={<Button />}>Delete replay</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete replay</DialogTitle>
                    <DialogDescription>
                        This permanently removes the replay from your account.
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton>
                    <Button variant="destructive">Delete replay</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
}

export const Open: Story = {
    render: ({ ...args }) => (
        <Dialog {...args} defaultOpen>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Season 12 recap</DialogTitle>
                    <DialogDescription>
                        Diamond II · 1,842 rating · 214 games played.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton>
                    <Button>View ladder</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
}

export const WithoutCloseButton: Story = {
    render: ({ ...args }) => (
        <Dialog {...args}>
            <DialogTrigger render={<Button variant="outline" />}>
                Open
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Confirm</DialogTitle>
                    <DialogDescription>
                        The close affordance can be hidden when the footer
                        already offers one.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton />
            </DialogContent>
        </Dialog>
    ),
}
