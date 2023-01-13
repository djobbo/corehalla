import { BackToTopIcon } from "ui/icons"
import { Tooltip } from "ui/base/Tooltip"
import { cn } from "common/helpers/classnames"
import { useWindowScroll } from "common/hooks/useWindowScroll"

export const BackToTopButton = () => {
    const { y: scrollY } = useWindowScroll()

    return (
        <div
            className={cn("fixed right-0 bottom-0 z-30", {
                "opacity-0 pointer-events-none": scrollY <= 0,
            })}
        >
            <Tooltip content="Back to top">
                <button
                    type="button"
                    className="relative w-12 h-12 mx-4 mb-4 rounded-full bg-accent flex items-center justify-center shadow-md"
                    style={{
                        transition: "0.15s opacity ease",
                    }}
                    onClick={() => {
                        window.scrollTo({
                            top: 0,
                        })
                    }}
                >
                    <BackToTopIcon size={20} />
                </button>
            </Tooltip>
        </div>
    )
}
