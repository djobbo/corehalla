import type { Meta, StoryObj } from "@storybook/react-vite"
import { SearchProvider, SearchTrigger } from "./Search"
import { withMockApi } from "@/storybook/decorators"
import { useEffect } from "react"

const meta = {
    title: "Features/Layout/Search",
    component: SearchProvider,
    decorators: [withMockApi],
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SearchProvider>

export default meta
type Story = StoryObj<typeof meta>

export const Trigger: Story = {
    args: {
        children: <SearchTrigger className="max-w-xl" />,
    },
}

/** Deferred so the provider's document listener is registered first. */
const OpenOnMount = () => {
    useEffect(() => {
        const handle = window.setTimeout(() => {
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "/" }))
        }, 0)

        return () => window.clearTimeout(handle)
    }, [])

    return null
}

export const Open: Story = {
    args: {
        children: (
            <>
                <SearchTrigger className="max-w-xl" />
                <OpenOnMount />
            </>
        ),
    },
}
