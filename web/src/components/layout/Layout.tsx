import { FirstTimePopup } from "@components/FirstTimePopup"
import { Footer } from "./Footer"
import { Header } from "./Header"
import { LandingBackground } from "./LandingBackground"
import { SideNav } from "./SideNav"
import { bgVar1 } from "ui/theme/theme"
import { styled } from "ui/theme"
import type { ReactNode } from "react"

export type LayoutProps = {
    children: ReactNode
}

const BackgroundContainer = styled("div", {
    "&>svg": {
        maskImage: `linear-gradient(0deg, ${bgVar1}00 0%, ${bgVar1} 40%)`,
    },
})

export const Layout = ({ children }: LayoutProps) => {
    return (
        <>
            <BackgroundContainer className="w-full h-screen absolute">
                <LandingBackground className="w-full h-5/6" />
            </BackgroundContainer>
            {/* Nothing here paints a background: the landing pattern shows
                through the whole page. The header and sidebar carry their own
                opaque surfaces on pages other than the landing. */}
            <div className="relative z-10 flex">
                <SideNav />
                <div className="overflow-y-auto flex-1">
                    <Header className="max-w-screen-xl mx-auto" />
                    <div className="rounded-tl-2xl">
                        <div className="max-w-screen-xl mx-auto px-4 pt-4">
                            {children}
                        </div>
                    </div>
                    <Footer className="bg-bgVar2 mt-16" />
                </div>
            </div>
            <FirstTimePopup />
        </>
    )
}
