import {
    ChevronDoubleUpIcon,
    LightningBoltIcon,
    UserGroupIcon,
    UsersIcon,
} from "@heroicons/react/outline"
import { cn } from "common/helpers/classnames"

const subHeaderNavigation = [
    {
        title: "1v1 Rankings",
        href: "/rankings",
        icon: <ChevronDoubleUpIcon className="w-6 h-6" strokeWidth={1} />,
    },
    {
        title: "2v2 Rankings",
        href: "/rankings/2v2",
        icon: <UsersIcon className="w-6 h-6" strokeWidth={1} />,
    },
    {
        title: "Power Rankings",
        href: "/rankings/power",
        icon: <LightningBoltIcon className="w-6 h-6" strokeWidth={1} />,
    },
    {
        title: "Clans",
        href: "/clans",
        icon: <UserGroupIcon className="w-6 h-6" strokeWidth={1} />,
    },
]

type SubHeaderProps = {
    className?: string
}

export const AppNav = ({ className }: SubHeaderProps) => {
    return (
        <div
            className={cn(
                className,
                "p-4 rounded-xl flex items-center justify-around max-w-screen-lg mx-auto gap-8 bg-gradient-to-l from-accent to-accentAlt shadow-md",
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
    )
}