import { legendIconSrc } from "@/lib/assets"
import { useLegendIcon } from "@/lib/media"
import { rotationSlots } from "@/lib/rotation"
import type { RotationLegend } from "@/lib/rotation"

const RotationIcon = ({ legend }: { readonly legend: RotationLegend }) => (
    <img
        src={useLegendIcon(
            legend.legend_name_key,
            legendIconSrc(legend.legend_name_key),
        )}
        alt=""
        className="block size-14 object-contain sm:size-16"
    />
)

export const WeeklyRotation = ({
    rotation,
}: {
    readonly rotation: readonly RotationLegend[]
}) => (
    <section aria-labelledby="weekly-rotation" className="mt-10">
        <p id="weekly-rotation" className="ch-kicker">
            Free legends this week
        </p>
        <ul className="mt-2 grid grid-cols-3 gap-2 rounded-none bg-card p-3 shadow-md sm:grid-cols-5 lg:grid-cols-9 lg:gap-3 lg:p-4">
            {rotationSlots(rotation).map((slot, index) => (
                <li
                    key={slot ? slot.legend_id : `empty-${index}`}
                    className="flex min-w-0 flex-col items-center gap-1.5"
                >
                    {slot ? (
                        <>
                            <RotationIcon legend={slot} />
                            <span className="w-full truncate text-center text-[0.62rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
                                {slot.bio_name}
                            </span>
                        </>
                    ) : (
                        <span
                            aria-hidden
                            className="block size-14 rounded-lg bg-bgVar2 sm:size-16"
                        />
                    )}
                </li>
            ))}
        </ul>
    </section>
)
