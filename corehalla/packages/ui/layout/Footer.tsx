import { border, text } from "../theme"
import { cn } from "common/helpers/classnames"

export const Footer = () => {
    return (
        <footer className="p-12">
            <div
                className={cn(
                    "max-w-screen-lg mx-auto flex flex-col justify-center items-center border-t pt-12",
                    border("blue6"),
                )}
            >
                <p className={cn("mr-1 text-xs", text("blue11"))}>© 2022</p>
                <a
                    className="font-bold hover:underline"
                    href="https://djobbo.com"
                >
                    Djobbo Maïga
                </a>
            </div>
        </footer>
    )
}
