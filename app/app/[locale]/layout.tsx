import "../globals.css"

import { AuthProvider } from "@/providers/auth/AuthProvider"
import { BackToTopButton } from "@/components/BackToTopButton"
import { FeatureFlagsProvider } from "@/store/useFeatures"
import { KBarProvider } from "@/components/search/KBarProvider"
import { LayoutContent } from "./_layout/LayoutContent"
import { type Metadata } from "next"
import { Montserrat } from "next/font/google"
import { type ReactNode } from "react"
import { SideNavProvider } from "@/providers/SideNavProvider"
import { TRPCProvider } from "../_trpc/TRPCProvider"
import { Toaster } from "react-hot-toast"
import { dir } from "i18next"

const montserrat = Montserrat({ subsets: ["latin"] })

export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.SITE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`,
    ),
    alternates: {
        canonical: "/",
        languages: {
            en: "/",
            fr: "/fr",
        },
    },
    title: "Track your Brawlhalla stats, view rankings, and more! • Corehalla",
    description:
        "Improve your Brawlhalla Game, and find your place among the Elite with our in-depth Player and Clan stats tracking and live leaderboards.",
    applicationName: "Corehalla",
    authors: [
        {
            name: "Djobbo",
            url: "https://djobbo.com",
        },
    ],
    creator: "Djobbo",
    openGraph: {
        type: "website",
        url: "https://corehalla.com",
        siteName: "Corehalla",
        title: "Corehalla",
        description:
            "Improve your Brawlhalla Game, and find your place among the Elite with our in-depth Player and Clan stats tracking and live leaderboards.",
        images: [
            {
                url: "/images/og/main-og.jpg",
                width: 1200,
                height: 630,
                alt: "Corehalla",
            },
        ],
    },
    twitter: {
        title: "Corehalla",
        description:
            "Improve your Brawlhalla Game, and find your place among the Elite with our in-depth Player and Clan stats tracking and live leaderboards.",
        images: [
            {
                url: "/images/og/main-og.jpg",
                width: 1200,
                height: 630,
                alt: "Corehalla",
            },
        ],
        creator: "@djobbo_",
        site: "@Corehalla",
    },
}

type RootLayoutProps = {
    children: ReactNode
    params: {
        locale: string
    }
}

export default async function RootLayout({
    children,
    params,
}: RootLayoutProps) {
    return (
        <TRPCProvider>
            <FeatureFlagsProvider>
                <AuthProvider>
                    <html lang={params.locale} dir={dir(params.locale)}>
                        <body className={montserrat.className}>
                            {/* TODO: reactivate GAScripts Google Analytics */}
                            {/* <GAScripts /> */}

                            {/* TODO: change kbar for shadcn ui search */}
                            <KBarProvider actions={[]} options={{}}>
                                <SideNavProvider>
                                    <Toaster />
                                    <LayoutContent>{children}</LayoutContent>
                                    {/* <Searchbox /> */}
                                    <BackToTopButton />
                                </SideNavProvider>
                            </KBarProvider>
                        </body>
                    </html>
                </AuthProvider>
            </FeatureFlagsProvider>
        </TRPCProvider>
    )
}