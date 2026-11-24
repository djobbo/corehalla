import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { FavoriteButton } from "@/components/account/FavoriteButton"
import { withMockApi } from "@/storybook/decorators"
import { ShareButton } from "./ShareButton"

/**
 * `Copied` runs in a real browser, where the share sheet and the clipboard need
 * a user gesture and a permission this workshop does not grant. Both are
 * replaced for the duration of the play function so the story exercises the
 * fallback branch deterministically.
 */
const stubBrowserSharing = () => {
    const share = Object.getOwnPropertyDescriptor(navigator, "share")
    const clipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard")

    Object.defineProperty(navigator, "share", {
        configurable: true,
        value: undefined,
    })
    Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.resolve() },
    })

    return () => {
        if (share) Object.defineProperty(navigator, "share", share)
        else Reflect.deleteProperty(navigator, "share")

        if (clipboard) Object.defineProperty(navigator, "clipboard", clipboard)
        else Reflect.deleteProperty(navigator, "clipboard")
    }
}

const meta = {
    title: "Patterns/Share button",
    component: ShareButton,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof ShareButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { name: "Lopes", path: "/stats/players/lopes" },
}

export const Copied: Story = {
    args: { name: "Lopes", path: "/stats/players/lopes" },
    async play({ canvasElement }) {
        const restore = stubBrowserSharing()

        try {
            const canvas = within(canvasElement)
            const button = canvas.getByRole("button", {
                name: "Share Lopes's profile",
            })

            await userEvent.click(button)

            await expect(button).toHaveTextContent("Link copied")
            await expect(await canvas.findByRole("status")).toHaveTextContent(
                "Link to Lopes's profile copied to the clipboard.",
            )
        } finally {
            restore()
        }
    },
}

export const Narrow: Story = {
    args: { name: "Lopes", path: "/stats/players/lopes" },
    render: (args) => (
        <div className="w-[320px]">
            <div className="flex flex-wrap items-center gap-3">
                <span className="ch-display text-2xl">Lopes</span>
                <FavoriteButton type="player" id="1" name="Lopes" />
                <ShareButton {...args} />
            </div>
        </div>
    ),
}
