import Rankings2v2Page from "../../../pages/rankings/2v2/[[...rankingsOptions]]"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/rankings/2v2/{-$region}/{-$page}")({
    component: Rankings2v2Page,
})
