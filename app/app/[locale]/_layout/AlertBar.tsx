import { InfoIcon } from "ui/icons"
import { alerts } from "@/util/alerts"

const CURRENT_ALERT = process.env.NEXT_PUBLIC_ALERT as
    | keyof typeof alerts
    | undefined

export const AlertBar = () => {
    if (!CURRENT_ALERT) return null

    const alertContent = alerts[CURRENT_ALERT]

    if (!alertContent) return null

    return (
        <div className="w-full text-sm bg-bg py-2 px-4 flex justify-center items-center gap-2">
            <InfoIcon size={16} /> {alertContent}
        </div>
    )
}
