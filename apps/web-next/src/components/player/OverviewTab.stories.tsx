import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor, within } from "storybook/test"
import { OverviewTab } from "./OverviewTab"
import { withMockApi } from "@/storybook/decorators"
import {
    EMPTY_PLAYER_ID,
    PLAYER_ID,
    SHORT_SEASON_PLAYER_ID,
    SOLO_QUEUE_PLAYER_ID,
    UNPLACED_PLAYER_ID,
    playerMock,
} from "@/storybook/fixtures"

const meta = {
    title: "Features/Player/Overview tab",
    component: OverviewTab,
    decorators: [withMockApi],
    parameters: { layout: "padded", mockApi: playerMock },
} satisfies Meta<typeof OverviewTab>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { playerId: PLAYER_ID },
}

export const Empty: Story = {
    args: { playerId: EMPTY_PLAYER_ID },
}

export const BelowGloryThreshold: Story = {
    args: { playerId: SHORT_SEASON_PLAYER_ID },
}

/** An unplaced 1v1 card beside the placed 3v3 card: no tier, rating or percentile. */
export const InPlacements: Story = {
    args: { playerId: UNPLACED_PLAYER_ID },
    async play({ canvasElement }) {
        const canvas = within(canvasElement)

        await expect(
            await canvas.findByText(
                "The rating appears once placement matches are complete.",
            ),
        ).toBeVisible()
        await expect(canvas.getByText("Placements")).toBeVisible()
        await expect(canvas.getByText("Platinum 3")).toBeVisible()
        await expect(canvas.queryByText("0 / 0 peak")).toBeNull()
    },
}

/** The headline pair: partner link, team record and the whole 2v2 summary. */
export const BestTeam: Story = {
    args: { playerId: PLAYER_ID },
    async play({ canvasElement }) {
        const canvas = within(canvasElement)
        const title = await canvas.findByRole("heading", {
            name: "Best 2v2 team",
        })
        const card = title.closest("[data-slot='card']")

        await expect(card).not.toBeNull()

        const withinCard = within(card as HTMLElement)

        await expect(
            withinCard.getByRole("link", { name: "Sandstorm" }),
        ).toHaveAttribute("href", "/stats/players/sandstorm")
        await expect(withinCard.getByText("2,010")).toBeVisible()
        await expect(withinCard.getByText(/2,065 peak/)).toBeVisible()
        await expect(withinCard.getByText("Diamond")).toBeVisible()
        await expect(withinCard.getByText(/2 paired teams/)).toBeVisible()
        await expect(withinCard.getByText(/380 games/)).toBeVisible()
        await expect(withinCard.getByText(/1950 average rating/)).toBeVisible()
        await expect(
            withinCard.getByRole("link", { name: "Full 2v2 record" }),
        ).toHaveAttribute("href", "/stats/players/mordex/2v2")
    },
}

/** Solo queue only: the 2v2 headline has no pair to show, the solo card stays. */
export const SoloQueueOnly: Story = {
    args: { playerId: SOLO_QUEUE_PLAYER_ID },
    async play({ canvasElement }) {
        const canvas = within(canvasElement)

        await expect(
            await canvas.findByRole("heading", { name: "Solo queue" }),
        ).toBeVisible()
        await waitFor(() =>
            expect(
                canvas.queryByRole("heading", { name: "Best 2v2 team" }),
            ).toBeNull(),
        )
    },
}

/** A failed teams read hides the card without touching the rest of the overview. */
export const TeamsReadFailed: Story = {
    args: { playerId: PLAYER_ID },
    parameters: {
        mockApiFailures: [`/api/v1/players/${PLAYER_ID}/teams`],
    },
    async play({ canvasElement }) {
        const canvas = within(canvasElement)

        await expect(
            await canvas.findByRole("heading", { name: "Ranked 1v1" }),
        ).toBeVisible()
        await expect(canvas.getByText("Ranked Season")).toBeVisible()
        await waitFor(() =>
            expect(
                canvas.queryByRole("heading", { name: "Best 2v2 team" }),
            ).toBeNull(),
        )
    },
}
