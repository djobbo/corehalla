import { trpc } from "../util/trpc"

export const useWeeklyRotation = () => {
    const { data, ...query } = trpc.getWeeklyRotation.useQuery(void 0, {
        trpc: {
            ssr: false,
        },
    })

    return {
        weeklyRotation: data ?? [],
        ...query,
    }
}
