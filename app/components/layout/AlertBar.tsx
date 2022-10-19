import { HiOutlineInformationCircle } from "react-icons/hi"
import { alerts } from "@util/alerts"

type AlertBarProps = {
    alert?: keyof typeof alerts
}

export const AlertBar = ({ alert }: AlertBarProps) => {
    if (!alert) return null

    return (
        <div className="w-full text-sm bg-bg py-2 px-4 flex justify-center items-center gap-2">
            <HiOutlineInformationCircle size={16} /> {alerts[alert]}
        </div>
    )
}
