import { Progress as BaseProgress } from "@base-ui/react/progress"

type ProgressProps = {
    value: number
    className?: string
    indicatorClassName?: string
}

export const Progress = ({
    value,
    className,
    indicatorClassName,
}: ProgressProps) => {
    return (
        <BaseProgress.Root value={value} className={className}>
            <BaseProgress.Track className="h-full w-full">
                <BaseProgress.Indicator className={indicatorClassName} />
            </BaseProgress.Track>
        </BaseProgress.Root>
    )
}
