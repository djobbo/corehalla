import { GA_TRACKING_ID, adsenseCaPub, gaPageview } from "./gtag"
import { useRouterState } from "@tanstack/react-router"
import { useEffect } from "react"

export const GAScripts = () => {
    const pathname = useRouterState({ select: (s) => s.location.pathname })

    useEffect(() => {
        gaPageview(pathname)
    }, [pathname])

    useEffect(() => {
        if (typeof document === "undefined") return

        const gtagScript = document.createElement("script")
        gtagScript.async = true
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
        document.head.appendChild(gtagScript)

        const gtagInit = document.createElement("script")
        gtagInit.id = "gtag-init"
        gtagInit.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_TRACKING_ID}', {
            page_path: window.location.pathname,
        });
        `
        document.head.appendChild(gtagInit)

        const adsenseScript = document.createElement("script")
        adsenseScript.async = true
        adsenseScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseCaPub}`
        adsenseScript.crossOrigin = "anonymous"
        document.head.appendChild(adsenseScript)

        return () => {
            gtagScript.remove()
            gtagInit.remove()
            adsenseScript.remove()
        }
    }, [])

    return null
}
