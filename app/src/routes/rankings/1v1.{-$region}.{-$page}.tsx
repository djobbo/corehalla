import Rankings1v1Page from "../../../pages/rankings/1v1/[[...rankingsOptions]]"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

const searchSchema = z.object({
    player: z.string().optional(),
})

export const Route = createFileRoute("/rankings/1v1/{-$region}/{-$page}")({
    validateSearch: searchSchema,
    component: Rankings1v1Page,
})
