import { Button } from "ui/base/Button"
import { DiscordIcon, GithubIcon } from "ui/icons"
import { Image } from "@components/Image"
import { SectionTitle } from "./SectionTitle"
import { useRouter } from "next/router"

type ErrorPageContentProps = {
    title?: string
    statusCode?: number
}

export const ErrorPageContent = ({
    title = "Oops, something went wrong",
    statusCode,
}: ErrorPageContentProps) => {
    const router = useRouter()

    return (
        <div>
            <SectionTitle className="text-center">{title}</SectionTitle>
            {statusCode && (
                <Image
                    src={`/images/errors/${statusCode}.png`}
                    alt={`${statusCode} Error`}
                    containerClassName="w-full h-full min-h-[240px] md:min-h-[400px]"
                    className="object-contain object-center"
                />
            )}
            <div className="flex flex-col justify-center items-center gap-4">
                <Button buttonStyle="primary" onClick={() => router.push("/")}>
                    Bring me home
                </Button>
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
