import { ErrorPageContent } from "@components/layout/ErrorPageContent"
import type { NextPage } from "next"

const ErrorPage: NextPage = () => {
    return <ErrorPageContent title="Page not found" statusCode={404} />
}

export default ErrorPage
