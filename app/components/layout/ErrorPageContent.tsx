import { Button } from "ui/base/Button"
import { SectionTitle } from "./SectionTitle"
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
                <div className="relative w-full h-full min-h-[400px]">
                    <Image
                        src={`/images/errors/${statusCode}.png`}
                        alt={`${statusCode} Error`}
                        layout="fill"
                        objectFit="contain"
                        objectPosition="center"
                    />
                </div>
            )}
            <div className="flex justify-center items-center">
                <Button buttonStyle="primary" onClick={() => router.push("/")}>
                    Bring me home
                </Button>
            </div>
        </div>
    )
}
