import { currentAlert } from "@/lib/alerts"

const configuredAlertKey = import.meta.env.VITE_ALERT as string | undefined

type AlertBarProps = {
    /** Defaults to the build's `VITE_ALERT`; stories pass a key directly. */
    readonly alertKey?: string
}

export const AlertBar = ({ alertKey = configuredAlertKey }: AlertBarProps) => {
    const alert = currentAlert(alertKey)

    if (alert === null) return null

    return (
        <div className="ch-alert">
            <p className="ch-alert-body">
                <span aria-hidden className="ch-alert-mark" />
                <span>{alert.text}</span>
                {alert.link === undefined ? null : (
                    <a
                        className="ch-alert-link"
                        href={alert.link.href}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {alert.link.label}
                    </a>
                )}
            </p>
        </div>
    )
}
