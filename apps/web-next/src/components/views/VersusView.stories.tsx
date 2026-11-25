import { expect, userEvent, within } from "storybook/test"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { VersusLoader, VersusPicker } from "./VersusView"
import { withMockApi } from "@/storybook/decorators"
import {
    EMPTY_PLAYER_ID,
    NO_OVERLAP_PLAYER_ID,
    PLAYER_ID,
    RIVAL_PLAYER_ID,
    versusMock,
} from "@/storybook/fixtures"

/**
 * `/vs` with both players already in the URL: the loader has dehydrated both
 * profile endpoints, so the stories exercise the two-column table the route
 * server-renders.
 */
const meta = {
    title: "Views/Versus",
    decorators: [withMockApi],
    parameters: { layout: "fullscreen", mockApi: versusMock },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const TwoPlayers: Story = {
    render: () => (
        <div className="ch-page">
            <VersusLoader aId={PLAYER_ID} bId={RIVAL_PLAYER_ID} />
        </div>
    ),
}

/** The opponent has never placed; the ranked rows dash instead of reading zero. */
export const UnrankedOpponent: Story = {
    render: () => (
        <div className="ch-page">
            <VersusLoader aId={PLAYER_ID} bId={EMPTY_PLAYER_ID} />
        </div>
    ),
    async play({ canvasElement }) {
        const canvas = within(canvasElement)

        await expect(
            await canvas.findByText("FreshlyPlaced has no legend games yet."),
        ).toBeVisible()
    },
}

/** Both pools overlap: the shared legends table follows the metric table. */
export const SharedLegends: Story = {
    render: () => (
        <div className="ch-page">
            <VersusLoader aId={PLAYER_ID} bId={RIVAL_PLAYER_ID} />
        </div>
    ),
    async play({ canvasElement }) {
        const canvas = within(canvasElement)

        await expect(
            await canvas.findByRole("heading", { name: "Shared legends" }),
        ).toBeVisible()
        await expect(canvas.getByRole("link", { name: "Mordex" })).toBeVisible()
        await expect(
            canvas.queryByRole("link", { name: "Brynn" }),
        ).not.toBeInTheDocument()
    },
}

/** Disjoint pools: the section says so instead of rendering an empty table. */
export const NoSharedLegends: Story = {
    render: () => (
        <div className="ch-page">
            <VersusLoader aId={PLAYER_ID} bId={NO_OVERLAP_PLAYER_ID} />
        </div>
    ),
    async play({ canvasElement }) {
        const canvas = within(canvasElement)

        await expect(
            await canvas.findByText(
                "Mordex and Boomie have not played any of the same legends.",
            ),
        ).toBeVisible()
    },
}

/** An empty picker with the search route mocked: typing turns up players only. */
export const Picker: Story = {
    render: () => (
        <div className="ch-page">
            <VersusPicker />
        </div>
    ),
    async play({ canvasElement }) {
        const canvas = within(canvasElement)

        await userEvent.type(canvas.getByLabelText("Player one"), "mor")

        await expect(
            await canvas.findByRole("button", { name: /Mordex/ }),
        ).toBeVisible()
        await expect(canvas.queryByText("Wolfpack")).not.toBeInTheDocument()
    },
}
