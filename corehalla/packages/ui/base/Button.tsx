import { cn } from "common/helpers/classnames"
import { css, theme } from "../theme"
import Link from "next/link"
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react"

type ButtonType = "a" | "button"
type ButtonStyle = "primary"

export type ButtonProps<Type extends ButtonType> = {
    as?: Type
    buttonStyle?: ButtonStyle
    large?: boolean
} & (Type extends "a"
    ? AnchorHTMLAttributes<HTMLAnchorElement>
    : ButtonHTMLAttributes<HTMLButtonElement>)

const buttonStyles = css({
    variants: {
        buttonStyle: {
            primary: {
                color: theme.colors.blue12,
                background: theme.colors.blue9,
                "&:hover": {
                    background: theme.colors.blue10,
                },
            },
        },
    },
    defaultVariants: {
        buttonStyle: "primary",
    },
})

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
        "flex font-semibold cursor-pointer items-center justify-center",
        {
            "shadow-md": buttonStyle === "primary",
        },
        buttonStyles({ buttonStyle }),
        {
            "rounded-xl py-2 px-4 text-base": large,
            "rounded-lg py-2 px-3 text-sm": !large,
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
