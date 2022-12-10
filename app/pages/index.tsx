import { Button } from "ui/base/Button"
import { DiscordIcon, GithubIcon } from "ui/icons"
import { SectionTitle } from "@components/layout/SectionTitle"

const Page = () => {
    return (
        <div>
            <SectionTitle className="text-center">
                Maintenance ongoing, sorry for the inconvenience
            </SectionTitle>
            <div className="flex flex-col justify-center items-center gap-4">
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

export default Page
