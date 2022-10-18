import { AppLink } from "ui/base/AppLink"
import { Button } from "ui/base/Button"
import { HiX } from "react-icons/hi"
import { SiDiscord, SiGithub, SiTwitter } from "react-icons/si"
import { useLocalStorageState } from "common/hooks/useLocalStorageState"

export const FirstTimePopup = () => {
    const [showPopup, setShowPopup] = useLocalStorageState(
        "first-time-popup",
        true,
        false,
    )

    if (!showPopup) return null

    return (
        <div className="fixed left-auto bottom-0 right-0 w-full max-w-sm flex flex-col gap-4 items-center justify-center bg-bgVar2 border border-bgVar1 rounded-lg m-2 p-4 z-50 shadow-md">
            <p className="flex flex-col items-center gap-3 text-center">
                Welcome to the new and improved Corehalla 🎉. Have fun
                exploring!
                <br />
                <span className="flex items-center gap-4">
                    <span className="text-sm text-textVar1">Join us:</span>
                    <AppLink
                        className="text-textVar1 hover:text-text"
                        href="/discord"
                        target="_blank"
                    >
                        <SiDiscord size="24" />
                    </AppLink>
                    <AppLink
                        className="text-textVar1 hover:text-text"
                        href="/twitter"
                        target="_blank"
                    >
                        <SiTwitter size="24" />
                    </AppLink>
                    <AppLink
                        className="text-textVar1 hover:text-text"
                        href="/github"
                        target="_blank"
                    >
                        <SiGithub size="24" />
                    </AppLink>
                </span>
                <span className="block text-xs text-textVar1">
                    If you want, you can still visit the legacy website here:{" "}
                    <AppLink
                        href="https://old.corehalla.com"
                        className="text-text text-sm font-bold hover:text-accent cursor-pointer"
                        target="_blank"
                    >
                        old.corehalla.com
                    </AppLink>
                </span>
            </p>
            <Button
                onClick={() => {
                    setShowPopup(false)
                }}
            >
                I understand 💪
            </Button>
            <button
                type="button"
                className="absolute top-0 right-0 text-text text-sm font-bold hover:text-accent cursor-pointer p-2"
                onClick={() => {
                    setShowPopup(false)
                }}
            >
                <HiX size={16} />
            </button>
        </div>
    )
}
