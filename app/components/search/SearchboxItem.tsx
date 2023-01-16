import { AppLink } from "ui/base/AppLink"
import { useKBar } from "kbar"
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
    const {
        query: { toggle },
    } = useKBar()

    return (
        <AppLink
            href={href}
            onClick={() => toggle()}
            className="px-4 py-3 w-full flex items-center justify-between border-b cursor-pointer border-bgVar2 hover:bg-bg/75"
        >
            <div className="flex items-center">
                {icon}
                <div className="ml-4">
                    <p>{title}</p>
                    {subtitle && (
                        <p className="text-xs text-textVar1">{subtitle}</p>
                    )}
                </div>
            </div>
            {rightContent}
        </AppLink>
    )
}
