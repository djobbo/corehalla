import { Image } from "@/components/Image"
import { Tooltip } from "ui/base/Tooltip"
import { Trans } from "@lingui/macro"
import { UnknownIcon } from "ui/icons"
import { getWeeklyRotation } from "web-parser/common"

export const WeeklyRotation = async () => {
    const weeklyRotation = await getWeeklyRotation()

    if (weeklyRotation.length === 0) return null

    return (
        <div className="flex flex-col items-center">
            <div className="mx-auto grid gap-4 grid-cols-3 md:grid-cols-9 p-4 rounded-2xl bg-bgVar2 border border-bg">
                {weeklyRotation.length > 0
                    ? weeklyRotation.map((legend) => (
                          <Tooltip
                              key={legend.legend_id}
                              content={legend.bio_name}
                          >
                              <Image
                                  src={`/images/icons/roster/legends/${legend.legend_name_key}.png`}
                                  alt={legend.bio_name}
                                  containerClassName="w-16 h-16 rounded-md"
                                  className="object-contain object-center border border-bg rounded-lg transition-transform scale-100 hover:scale-105"
                              />
                          </Tooltip>
                      ))
                    : Array.from({ length: 9 }, (_, i) => (
                          <div
                              key={i}
                              className="relative w-16 h-16 rounded-md bg-bg flex justify-center items-center border border-bg"
                          >
                              <UnknownIcon className="w-12 h-12 stroke-bgVar2" />
                          </div>
                      ))}
            </div>
            <span className="text-sm text-textVar1 mt-2">
                <Trans>Free Legends Rotation</Trans>
            </span>
        </div>
    )
}
