import { Button } from "ui/base/Button"
import { SectionTitle } from "./SectionTitle"
import { SiDiscord, SiGithub } from "react-icons/si"
import { useRouter } from "next/router"
import Image from "next/image"

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
                <div className="relative w-full h-full min-h-[240px] md:min-h-[400px]">
                    <Image
                        src={`/images/errors/${statusCode}.png`}
                        alt={`${statusCode} Error`}
                        layout="fill"
                        objectFit="contain"
                        objectPosition="center"
                    />
                </div>
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
                        <SiDiscord size={16} /> Report bug
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
                        <SiGithub size={16} /> Contribute
                    </Button>
                </div>
            </div>
        </div>
    )
}
