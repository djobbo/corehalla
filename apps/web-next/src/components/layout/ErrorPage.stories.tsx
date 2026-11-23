import type { Meta, StoryObj } from "@storybook/react-vite"
import { ErrorPage } from "./ErrorPage"
import { notFoundPage, serverErrorPage } from "@/lib/errorPage"
import { withRouter } from "@/storybook/decorators"

const meta = {
    title: "Features/Layout/Error page",
    component: ErrorPage,
    decorators: [withRouter],
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ErrorPage>

export default meta
type Story = StoryObj<typeof meta>

export const NotFound: Story = {
    args: { page: notFoundPage },
}

export const ServerError: Story = {
    args: {
        page: serverErrorPage,
        onRetry() {},
    },
}
