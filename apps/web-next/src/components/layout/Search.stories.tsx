import type { Meta, StoryObj } from "@storybook/react-vite"
import { useAtomSet } from "@effect/atom-react"
import { SearchProvider, SearchTrigger } from "./Search"
import { withMockApi } from "@/storybook/decorators"
import { searchQueryAtom } from "@/effect/search"
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

/** Opens the palette with a query already typed, so every group can be seen. */
const OpenWithQuery = ({ value }: { readonly value: string }) => {
    const setQuery = useAtomSet(searchQueryAtom)

    useEffect(() => {
        const handle = window.setTimeout(() => {
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "/" }))
            setQuery(value)
        }, 0)

        return () => window.clearTimeout(handle)
    }, [setQuery, value])

    return null
}

/** Shaped to `LookupResultsSchema`. */
const MOCK_LOOKUP = [
    {
        type: "player",
        id: "1234",
        name: "Mordex",
        slug: "1234-mordex",
        aliases: [],
        rating: 1890,
        xp: null,
        tier: "Diamond",
        region: "eu",
        source: "rankings",
    },
]

export const CatalogueGroups: Story = {
    parameters: {
        mockApi: {
            "/api/v1/search": MOCK_LOOKUP,
            "/api/v1/search/players": [],
        },
    },
    args: {
        children: (
            <>
                <SearchTrigger className="max-w-xl" />
                <OpenWithQuery value="ord" />
            </>
        ),
    },
}

const EMPTY_SEARCH = {
    "/api/v1/search": [],
    "/api/v1/search/players": [],
}

/** A player whose name carries the same digits, so the id actions follow it. */
const MOCK_DIGITS_LOOKUP = [
    {
        type: "player",
        id: "123456",
        name: "Mordex123456",
        slug: "123456-mordex123456",
        aliases: [],
        rating: null,
        xp: null,
        tier: null,
        region: null,
        source: "rankings",
    },
]

const openedWith = (value: string) => ({
    children: (
        <>
            <SearchTrigger className="max-w-xl" />
            <OpenWithQuery value={value} />
        </>
    ),
})

export const IdActions: Story = {
    parameters: {
        mockApi: {
            "/api/v1/search": MOCK_DIGITS_LOOKUP,
            "/api/v1/search/players": [],
        },
    },
    args: openedWith("123456"),
}

export const IdActionsAtFloor: Story = {
    parameters: { mockApi: EMPTY_SEARCH },
    args: openedWith("123"),
}

export const NoIdActions: Story = {
    parameters: { mockApi: EMPTY_SEARCH },
    args: openedWith("ord"),
}
