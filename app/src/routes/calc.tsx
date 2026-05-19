import { createFileRoute } from "@tanstack/react-router"

import CalcPage from "../../pages/calc"

export const Route = createFileRoute("/calc")({
    component: CalcPage,
})
