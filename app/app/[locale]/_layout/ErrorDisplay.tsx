import { Button } from "ui/base/Button"
import { DiscordIcon, GithubIcon } from "ui/icons"
import { SectionTitle } from "@/components/layout/SectionTitle"
import { Trans } from "@lingui/macro"
import { useEffect } from "react"

type ErrorDisplayProps = {
    title?: string
    reset: () => void
    error: Error & { digest?: string }
}

export const ErrorDisplay = ({
    title = "Oops, something went wrong",
    reset,
    error,
}: ErrorDisplayProps) => {
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.log("error", error)
        // TODO: Log the error to an error reporting service
    }, [error])

    return (
        <div>
            <SectionTitle className="text-center">{title}</SectionTitle>
            <div className="flex flex-col justify-center items-center gap-4">
                {!!reset && (
                    <Button buttonStyle="primary" onClick={reset}>
                        <Trans>Try Again</Trans>
                    </Button>
                )}
                <div className="flex justify-center items-center gap-2">
                    <Button
                        buttonStyle="outline"
                        onClick={() => {
                            window
                                ?.open("/discord", "_blank", "noreferrer")
                                ?.focus()
                        }}
                        className="flex items-center gap-2"
                    >
                        <DiscordIcon size={16} /> Report bug
                    </Button>
                    <Button
                        buttonStyle="outline"
                        onClick={() => {
                            window
                                ?.open("/github", "_blank", "noreferrer")
                                ?.focus()
                        }}
                        className="flex items-center gap-2"
                    >
                        <GithubIcon size={16} /> Contribute
                    </Button>
                </div>
            </div>
        </div>
    )
}
