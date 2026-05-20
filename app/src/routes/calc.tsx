import { CalcPage } from "#/views/calc"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/calc")({
    component: CalcPage,
})
