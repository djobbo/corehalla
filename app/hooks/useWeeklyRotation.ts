import { useQuery } from "react-query"
import axios from "axios"
import type { Legend } from "bhapi/types"

export const useWeeklyRotation = () => {
    const { data: weeklyRotation, ...query } = useQuery(
        ["weekly-rotation"],
        async () => {
            const { data } = await axios.get<Legend[]>(`/api/weekly-rotation`)

            if (!data) throw new Error("No data")

            return data
        },
    )

    return {
        weeklyRotation: weeklyRotation ?? [],
        ...query,
    }
}
