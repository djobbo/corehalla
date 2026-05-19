import { alerts } from "#/util/alerts"
import { InfoIcon } from "ui/icons"

const CURRENT_ALERT = import.meta.env.VITE_ALERT as
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
