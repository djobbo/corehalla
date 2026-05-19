import { GA_TRACKING_ID, adsenseCaPub, gaPageview } from "./gtag"
import { useRouterState } from "@tanstack/react-router"
import { useEffect } from "react"

const initGtagStub = () => {
    window.dataLayer = window.dataLayer ?? []
    window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args)
    }
    window.gtag("js", new Date())
    window.gtag("config", GA_TRACKING_ID, {
        page_path: window.location.pathname,
    })
}

export const GAScripts = () => {
    const pathname = useRouterState({ select: (s) => s.location.pathname })

    useEffect(() => {
        if (typeof document === "undefined" || !GA_TRACKING_ID) return

        initGtagStub()

        const gtagScript = document.createElement("script")
        gtagScript.async = true
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
        document.head.appendChild(gtagScript)

        const adsenseScript = document.createElement("script")
        adsenseScript.async = true
        adsenseScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseCaPub}`
        adsenseScript.crossOrigin = "anonymous"
        document.head.appendChild(adsenseScript)

        return () => {
            gtagScript.remove()
            adsenseScript.remove()
            delete window.gtag
        }
    }, [])

    useEffect(() => {
        gaPageview(pathname)
    }, [pathname])

    return null
}
