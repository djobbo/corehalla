import { useEffect } from "react"
import { useRouter } from "next/router"
import type { NextPage } from "next"

const ErrorPage: NextPage = () => {
    const router = useRouter()

    useEffect(() => {
        router.replace("/")
    })

    return null
}

export default ErrorPage
