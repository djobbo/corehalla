import type { Meta, StoryObj } from "@storybook/react-vite"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "./navigation-menu"

const meta = {
    title: "Components/Navigation menu",
    component: NavigationMenu,
    parameters: { layout: "centered" },
} satisfies Meta<typeof NavigationMenu>

export default meta
type Story = StoryObj<typeof meta>

const list = (
    <NavigationMenuList>
        <NavigationMenuItem value="ladders">
            <NavigationMenuTrigger>Ladders</NavigationMenuTrigger>
            <NavigationMenuContent>
                <ul className="grid w-56 gap-1">
                    <li>
                        <NavigationMenuLink href="#">1v1</NavigationMenuLink>
                    </li>
                    <li>
                        <NavigationMenuLink href="#">2v2</NavigationMenuLink>
                    </li>
                    <li>
                        <NavigationMenuLink href="#">Clans</NavigationMenuLink>
                    </li>
                </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="stats">
            <NavigationMenuTrigger>Stats</NavigationMenuTrigger>
            <NavigationMenuContent>
                <ul className="grid w-56 gap-1">
                    <li>
                        <NavigationMenuLink href="#">
                            Season overview
                        </NavigationMenuLink>
                    </li>
                    <li>
                        <NavigationMenuLink href="#">
                            Legends
                        </NavigationMenuLink>
                    </li>
                </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
            <NavigationMenuLink href="#">News</NavigationMenuLink>
        </NavigationMenuItem>
    </NavigationMenuList>
)

export const Default: Story = {
    render: ({ ...args }) => <NavigationMenu {...args}>{list}</NavigationMenu>,
}

export const Open: Story = {
    render: ({ ...args }) => (
        <NavigationMenu {...args} defaultValue="ladders">
            {list}
        </NavigationMenu>
    ),
}
