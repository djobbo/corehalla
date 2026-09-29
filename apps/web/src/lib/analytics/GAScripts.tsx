import { GA_TRACKING_ID, adsenseCaPub, gaPageview } from "./gtag"
import { useEffect } from "react"
import { useRouter } from "@tanstack/react-router"

/**
 * Global Site Tag + Adsense loader.
 *
 * `next/script` had no equivalent, so the tags are rendered directly. React 19
 * hoists `async` scripts into the document head and keeps the inline init
 * script in place. Page views are reported from TanStack Router's `onResolved`
 * event instead of `next/router` events.
 */
export const GAScripts = () => {
    const router = useRouter()

    useEffect(() => {
        return router.subscribe("onResolved", () => {
            if (typeof window === "undefined") return
            gaPageview(window.location.pathname)
        })
    }, [router])

    return (
        <>
            {GA_TRACKING_ID && (
                <>
                    <script
                        async
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                    />
                    <script
                        id="gtag-init"
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
                </>
            )}
            {adsenseCaPub !== "ca-pub-" && (
                <script
                    async
                    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseCaPub}`}
                    crossOrigin="anonymous"
                />
            )}
        </>
    )
}
