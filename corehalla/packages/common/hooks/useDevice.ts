import { useEffect, useState } from "react"

const getCurrentDevice = () => {
    if (typeof window === "undefined") return ""

    const ua = navigator.userAgent

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua))
        return "tablet"

    if (
        /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
            ua,
        )
    )
        return "mobile"

    return navigator.platform.toUpperCase().indexOf("MAC") >= 0 ? "mac" : "pc"
}

export const useDevice = () => {
    const [device, setDevice] = useState<
        "" | "tablet" | "mobile" | "mac" | "pc"
    >("")

    useEffect(() => {
        setDevice(getCurrentDevice())
    }, [])

    return device
}
