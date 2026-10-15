import type { Meta, StoryObj } from "@storybook/react-vite"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "./table"

const meta = {
    title: "Components/Table",
    component: Table,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const rows = [
    { rank: 1, player: "Mordex", rating: 2184, games: 412, winRate: "58.4%" },
    {
        rank: 2,
        player: "Sandstorm",
        rating: 2141,
        games: 388,
        winRate: "57.1%",
    },
    { rank: 3, player: "Yuz", rating: 2108, games: 355, winRate: "55.9%" },
    { rank: 4, player: "Godly", rating: 2077, games: 341, winRate: "54.6%" },
]

export const Default: Story = {
    render: ({ ...args }) => (
        <Table {...args}>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">Games</TableHead>
                    <TableHead className="text-right">Win rate</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.rank}>
                        <TableCell className="text-muted-foreground">
                            {row.rank}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                            {row.player}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            {row.rating.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            {row.games}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            {row.winRate}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <TableCaption>Top four ranked players this season.</TableCaption>
        </Table>
    ),
}

export const WithFooter: Story = {
    render: ({ ...args }) => (
        <Table {...args}>
            <TableHeader>
                <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Games</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.rank}>
                        <TableCell className="font-medium text-foreground">
                            {row.player}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            {row.games}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right tabular-nums">
                        {rows.reduce((sum, row) => sum + row.games, 0)}
                    </TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    ),
}
