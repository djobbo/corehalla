import type { ReactNode } from "react"

type SearchboxItemProps = {
    icon?: ReactNode
    title: ReactNode
    subtitle?: ReactNode
    href: string
    rightContent?: ReactNode
}

export const SearchboxItem = ({
    icon,
    href,
    title,
    subtitle,
    rightContent,
}: SearchboxItemProps) => {
    return (
        <a
            href={href}
            className="px-4 py-3 w-full flex items-center justify-between gap-8 border-b cursor-pointer border-bgVar2 hover:bg-bg/75"
        >
            <div className="min-w-0 flex items-center flex-1">
                {icon}
                <div className="ml-4 min-w-0 flex-1">
                    <p className="truncate">{title}</p>
                    {subtitle && (
                        <p className="text-xs text-textVar1 truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {rightContent}
        </a>
    )
}
