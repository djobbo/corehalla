import { createFileRoute } from "@tanstack/react-router"
import { CalcPage } from "@views/calc"

export const Route = createFileRoute("/calc")({
    component: CalcPage,
})
