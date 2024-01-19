import { AnimatedLogo } from "ui/base/AnimatedLogo"

export default function Loading() {
    return (
        <div className="flex justify-center p-8 opacity-50">
            <AnimatedLogo size={48} />
        </div>
    )
}
