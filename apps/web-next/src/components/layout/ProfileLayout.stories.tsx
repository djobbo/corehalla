import type { Meta, StoryObj } from "@storybook/react-vite"
import { ProfileLayout } from "./ProfileLayout"

const meta = {
    title: "Features/Layout/Profile layout",
    component: ProfileLayout,
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ProfileLayout>

export default meta
type Story = StoryObj<typeof meta>

const PlayerAside = () => (
    <aside className="flex flex-col gap-4 bg-card p-4">
        <div className="flex items-center gap-3">
            <span aria-hidden className="ch-mark h-14 w-14 text-xl">
                <span>M</span>
            </span>
            <div className="min-w-0">
                <p className="ch-kicker">Player</p>
                <p className="ch-display truncate text-2xl">Mordex</p>
            </div>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
                <dt className="text-muted-foreground">Rating</dt>
                <dd className="font-semibold tabular-nums">2,104</dd>
            </div>
            <div>
                <dt className="text-muted-foreground">Peak</dt>
                <dd className="font-semibold tabular-nums">2,161</dd>
            </div>
            <div>
                <dt className="text-muted-foreground">Region</dt>
                <dd className="font-semibold">NA</dd>
            </div>
            <div>
                <dt className="text-muted-foreground">Level</dt>
                <dd className="font-semibold tabular-nums">84</dd>
            </div>
        </dl>
    </aside>
)

export const PlayerProfile: Story = {
    args: {
        aside: <PlayerAside />,
        children: (
            <div className="flex flex-col gap-4">
                <section className="bg-card p-4">
                    <h2 className="ch-kicker">Ranked 1v1</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        214 games · 125 wins · Valhallan
                    </p>
                </section>
                <section className="bg-card p-4">
                    <h2 className="ch-kicker">Top legends</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Bödvar, Mordex, Diana
                    </p>
                </section>
                <section className="bg-card p-4">
                    <h2 className="ch-kicker">Clan</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Wolfpack · 14 members
                    </p>
                </section>
            </div>
        ),
    },
}
