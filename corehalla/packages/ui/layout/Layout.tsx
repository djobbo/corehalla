import { Footer } from "./Footer"
import { Header } from "./Header"
import { SideNav } from "./SideNav"
import { styled } from "../theme"
import type { ReactNode } from "react"

export type LayoutProps = {
    children: ReactNode
    landingBackgroundImg?: string | null
}

export const Layout = ({ children, landingBackgroundImg }: LayoutProps) => {
    const LandingBackground = styled("div", {
        backgroundImage: `url(${landingBackgroundImg})`,
        opacity: "0.04",
        filter: "saturate(0.1)",
        zIndex: -1,
        maxHeight: "100vh",
    })

    return (
        <div className="relative z-10 flex">
            <SideNav />
            <div className="overflow-y-auto flex-1 mx-4 xl:mx-0">
                <Header />
                {landingBackgroundImg && (
                    <LandingBackground className="absolute top-0 inset-x-0 -bottom-8" />
                )}
                <div className="flex-1 max-w-screen-xl mx-auto">{children}</div>
                <Footer />
            </div>
        </div>
    )
}
