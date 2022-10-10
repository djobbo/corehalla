import {
    HiChevronDoubleUp,
    HiLightningBolt,
    HiUserGroup,
    HiUsers,
} from "react-icons/hi"
import { cn } from "common/helpers/classnames"

const subHeaderNavigation = [
    {
        title: "1v1 Rankings",
        href: "/rankings",
        icon: <HiChevronDoubleUp className="w-6 h-6" strokeWidth={1} />,
    },
    {
        title: "2v2 Rankings",
        href: "/rankings/2v2",
        icon: <HiUsers className="w-6 h-6" strokeWidth={1} />,
    },
    {
        title: "Power Rankings",
        href: "/rankings/power",
        icon: <HiLightningBolt className="w-6 h-6" strokeWidth={1} />,
    },
    {
        title: "Clans",
        href: "/clans",
        icon: <HiUserGroup className="w-6 h-6" strokeWidth={1} />,
    },
]

type SubHeaderProps = {
    className?: string
}

export const AppNav = ({ className }: SubHeaderProps) => {
    return (
        <div className="w-full gap-8 bg-gradient-to-l from-accent to-accentAlt shadow-md">
            <div
                className={cn(
                    className,
                    "mx-auto px-4 py-1 flex items-center justify-around max-w-screen-lg gap-8",
                )}
            >
                {subHeaderNavigation.map(({ title, href, icon }) => (
                    <a
                        key={title}
                        className="flex flex-col items-center justify-center w-32"
                        href={href}
                    >
                        {icon}
                        <span className="text-xs text-text mt-2">{title}</span>
                    </a>
                ))}
            </div>
        </div>
    )
}
