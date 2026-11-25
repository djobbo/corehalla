import type { Meta, StoryObj } from "@storybook/react-vite"
import { MetaCsvDownload } from "./MetaCsvDownload"

const meta = {
    title: "Common/CSV download",
    component: MetaCsvDownload,
    parameters: { layout: "padded" },
    args: {
        filename: "corehalla-legends-2200.csv",
        csv: "Legend,Games,Wins\r\nBödvar,2602100,1353092\r\n",
    },
} satisfies Meta<typeof MetaCsvDownload>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: "The board's export control. Pressing it saves the already-loaded rows under the floor's own file name — no request leaves the page.",
            },
        },
    },
}
