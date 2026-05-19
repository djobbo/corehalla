import { trpc } from "@util/trpc"

export const useWeeklyRotation = () => {
    const { data, ...query } = trpc.getWeeklyRotation.useQuery()

    return {
        weeklyRotation: data ?? [],
        ...query,
    }
}
