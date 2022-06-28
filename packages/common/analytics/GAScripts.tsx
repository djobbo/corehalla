import { GA_TRACKING_ID, adsenseCaPub, gaPageview } from "./gtag"
import { useEffect } from "react"
import { useRouter } from "next/router"
import Script from "next/script"

export const GAScripts = () => {
    const router = useRouter()

    useEffect(() => {
        const handleRouteChange = (url: string) => {
            gaPageview(url)
        }
        router.events.on("routeChangeComplete", handleRouteChange)
        router.events.on("hashChangeComplete", handleRouteChange)
        return () => {
            router.events.off("routeChangeComplete", handleRouteChange)
            router.events.off("hashChangeComplete", handleRouteChange)
        }
    }, [router.events])

    return (
        <>
            {/* Global Site Tag (gtag.js) - Google Analytics */}
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
                id="gtag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_TRACKING_ID}', {
            page_path: window.location.pathname,
        });
        `,
                }}
            />
            {/* Google Adsense */}
            <Script
                async
                src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseCaPub}`}
                crossOrigin="anonymous"
            />
        </>
    )
}
