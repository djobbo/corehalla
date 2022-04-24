import { Footer } from "./Footer"
import { Header } from "./Header"
import { LandingBackground } from "./LandingBackground"
import { SideNav } from "./SideNav"
import { bgVar1 } from "../theme/theme"
import { styled } from "../theme"
import type { ReactNode } from "react"

export type LayoutProps = {
    children: ReactNode
    showBackground?: boolean
}

const BackgroundContainer = styled("div", {
    "&>svg": {
        maskImage: `linear-gradient(0deg, ${bgVar1}00 0%, ${bgVar1} 40%)`,
    },
})

export const Layout = ({ children, showBackground }: LayoutProps) => {
    // const LandingBackground = styled("div", {
    //     backgroundImage: `url(${landingBackgroundImg})`,
    //     opacity: "0.04",
    //     filter: "saturate(0.1)",
    //     zIndex: -1,
    //     maxHeight: "100vh",
    // })

    return (
        <>
            {showBackground && (
                <BackgroundContainer className="w-full h-screen absolute opacity-50">
                    <LandingBackground className="w-full h-5/6" />
                </BackgroundContainer>
            )}
            <div className="relative z-10 flex">
                <SideNav />
                <div className="overflow-y-auto flex-1 mx-4 xl:mx-0">
                    <Header />
                    <div className="flex-1 max-w-screen-xl mx-auto">
                        {children}
                    </div>
                    <Footer />
                </div>
            </div>
        </>
    )
}
