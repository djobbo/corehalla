import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { ClanBody } from "./ClanBody"
import { withMockApi } from "@/storybook/decorators"
import {
    EMPTY_GUILD_ID,
    GUILD_ID,
    NO_POINTS_GUILD_ID,
    UNRATED_GUILD_ID,
    guildMock,
} from "@/storybook/fixtures"

const meta = {
    title: "Features/Clan/Clan body",
    component: ClanBody,
    decorators: [withMockApi],
    parameters: { layout: "padded", mockApi: guildMock },
} satisfies Meta<typeof ClanBody>

export default meta
type Story = StoryObj<typeof meta>

/** Mixed roster: rated members show a tier and rating, the rest show a dash. */
export const Default: Story = {
    args: { clanId: GUILD_ID },
}

/** Typing a name narrows the roster and the count names how many survive. */
export const FilteredByName: Story = {
    args: { clanId: GUILD_ID },
    async play({ canvasElement }) {
        const canvas = within(canvasElement)
        const search = await canvas.findByLabelText("Find a member")

        await userEvent.type(search, "mor")

        await expect(await canvas.findByText("1 of 4 members")).toBeVisible()
        await expect(canvas.getByRole("link", { name: "Mordex" })).toBeVisible()
        await expect(
            canvas.queryByRole("link", { name: "Sandstorm" }),
        ).not.toBeInTheDocument()
    },
}

/** The role chips list only the roles present, each with its member count. */
export const FilteredByRole: Story = {
    args: { clanId: GUILD_ID },
    async play({ canvasElement }) {
        const canvas = within(canvasElement)

        await userEvent.click(
            await canvas.findByRole("button", { name: /^Officer/ }),
        )

        await expect(await canvas.findByText("1 of 4 members")).toBeVisible()
        await expect(
            canvas.getByRole("link", { name: "Sandstorm" }),
        ).toBeVisible()
        await expect(
            canvas.queryByRole("link", { name: "Mordex" }),
        ).not.toBeInTheDocument()
    },
}

/** No match names the active filter, and clearing it restores the roster. */
export const NoMatches: Story = {
    args: { clanId: GUILD_ID },
    async play({ canvasElement }) {
        const canvas = within(canvasElement)
        const search = await canvas.findByLabelText("Find a member")

        await userEvent.type(search, "zzzz")

        await expect(await canvas.findByText("0 of 4 members")).toBeVisible()
        await expect(canvas.getByText("No members match “zzzz”.")).toBeVisible()

        await userEvent.click(
            canvas.getByRole("button", { name: "Clear filters" }),
        )

        await expect(await canvas.findByText("4 of 4 members")).toBeVisible()
    },
}

/** No member reports points: contributors fall back to XP and the roster loses its points order. */
export const WithoutGuildPoints: Story = {
    args: { clanId: NO_POINTS_GUILD_ID },
}

/** Every member is outside the index, so the rating sort has nothing to order. */
export const WithoutRatedMembers: Story = {
    args: { clanId: UNRATED_GUILD_ID },
}

export const EmptyRoster: Story = {
    args: { clanId: EMPTY_GUILD_ID },
}
