import type { Meta, StoryObj } from "@storybook/react-vite"
import { PageLoader, PageLoaderProbe, PageLoaderProvider } from "./PageLoader"
import { withRouter } from "@/storybook/decorators"

const meta = {
    title: "Features/Layout/Page loader",
    component: PageLoader,
    decorators: [withRouter],
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PageLoader>

export default meta
type Story = StoryObj<typeof meta>

export const Loading: Story = {
    render: () => (
        <PageLoaderProvider>
            <PageLoaderProbe />
            <PageLoader />
        </PageLoaderProvider>
    ),
}
