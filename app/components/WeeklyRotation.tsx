import { HiOutlineQuestionMarkCircle } from "react-icons/hi"
import { Tooltip } from "ui/base/Tooltip"
import Image from "next/image"
import type { Legend } from "bhapi/types"

type WeeklyRotationProps = {
    weeklyRotation: Legend[]
}

export const WeeklyRotation = ({ weeklyRotation }: WeeklyRotationProps) => {
    if (weeklyRotation.length <= 0) {
        return (
            <div className="flex gap-2">
                {Array.from({ length: 9 }, (_, i) => (
                    <div
                        key={i}
                        className="relative w-16 h-16 rounded-md bg-bg flex justify-center items-center"
                    >
                        <HiOutlineQuestionMarkCircle className="w-12 h-12 stroke-bgVar2" />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="flex gap-2">
            {weeklyRotation.map((legend) => (
                <Tooltip key={legend.legend_id} content={legend.bio_name}>
                    <div className="relative w-16 h-16 rounded-md">
                        <Image
                            src={`/images/icons/roster/legends/${legend.legend_name_key}.png`}
                            alt={legend.bio_name}
                            layout="fill"
                            objectFit="contain"
                            objectPosition="center"
                        />
                    </div>
                </Tooltip>
            ))}
        </div>
    )
}
