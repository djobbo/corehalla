import { cn } from "common/helpers/classnames"
import Link from "next/link"
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react"

type ButtonType = "a" | "button"
type ButtonStyle = "primary" | "outline"

export type ButtonProps<Type extends ButtonType> = {
    as?: Type
    buttonStyle?: ButtonStyle
    large?: boolean
} & (Type extends "a"
    ? AnchorHTMLAttributes<HTMLAnchorElement>
    : ButtonHTMLAttributes<HTMLButtonElement>)

export const Button = <Type extends ButtonType = "button">(
    props: ButtonProps<Type>,
) => {
    const {
        as,
        buttonStyle = "primary",
        large,
        className,
        ...buttonProps
    } = props
    const buttonClass = cn(
        "flex font-semibold cursor-pointer items-center justify-center rounded-lg",
        {
            "shadow-md bg-accent": buttonStyle === "primary",
            "border border-bg bg-transparent": buttonStyle === "outline",
        },
        {
            "py-2 px-4 text-base": large,
            "py-2 px-3 text-sm": !large,
        },
        className,
    )
    if (as === "a") {
        // @ts-expect-error spread type isn't narrowed correctly
        const { href, ...rest } = buttonProps
        return (
            <Link href={href}>
                {/* @ts-expect-error spread type isn't narrowed correctly */}
                <a className={buttonClass} {...rest} />
            </Link>
        )
    }
    // @ts-expect-error spread type isnt narrowed correctly
    return <button className={buttonClass} {...buttonProps} />
}
