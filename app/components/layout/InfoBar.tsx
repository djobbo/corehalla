import { HiOutlineInformationCircle } from "react-icons/hi"
import type { ReactNode } from "react"

type InfoBarProps = {
    children?: ReactNode
}

export const InfoBar = ({ children }: InfoBarProps) => {
    if (!children) return null
    return (
        <div className="w-full text-sm bg-bg py-2 px-4 flex justify-center items-center gap-2">
            <HiOutlineInformationCircle size={16} /> {children}
        </div>
    )
}
