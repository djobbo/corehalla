import { createFileRoute } from "@tanstack/react-router"
import { getWeeklyRotation } from "web-parser/weekly-rotation/getWeeklyRotation"

/** Server route replacing `pages/api/weekly-rotation.ts`. */
export const Route = createFileRoute("/api/weekly-rotation")({
    server: {
        handlers: {
            async GET() {
                try {
                    const weeklyRotation = await getWeeklyRotation()

                    return Response.json(weeklyRotation, {
                        headers: {
                            "Cache-Control":
                                "public, s-maxage=3600, stale-while-revalidate=7200",
                        },
                    })
                } catch {
                    return Response.json(
                        { error: "Failed to fetch weekly rotation" },
                        { status: 500 },
                    )
                }
            },
        },
    },
})
