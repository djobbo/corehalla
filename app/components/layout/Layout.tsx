import { FirstTimePopup } from "@components/FirstTimePopup"
import type { ReactNode } from "react"
import { styled, theme } from "ui/theme"

import { Footer } from "./Footer"
import { Header } from "./Header"
import { LandingBackground } from "./LandingBackground"
import { SideNav } from "./SideNav"

export type LayoutProps = {
    children: ReactNode
}

const BackgroundContainer = styled("div", {
    "&>svg": {
        maskImage: `linear-gradient(0deg, ${theme.colors.bgVar1}00 0%, ${theme.colors.bgVar1} 40%)`,
    },
})

export const Layout = ({ children }: LayoutProps) => {
    return (
        <>
            <BackgroundContainer className="w-full h-screen absolute">
                <LandingBackground className="w-full h-5/6" />
            </BackgroundContainer>
            <div className="relative z-10 flex">
                <SideNav />
                <div className="overflow-y-auto flex-1">
                    <Header className="max-w-screen-xl mx-auto" />
                    <div className="max-w-screen-xl mx-auto px-4 pl:mx-0 mt-4">
                        {children}
                    </div>
                    <Footer className="bg-bgVar2 mt-16" />
                </div>
            </div>
            <FirstTimePopup />
        </>
    )
}
