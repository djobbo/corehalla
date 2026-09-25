import { HiCheck } from "@react-icons/all-files/hi/HiCheck"
import { HiChevronDown } from "@react-icons/all-files/hi/HiChevronDown"
import { cn } from "common/helpers/classnames"
import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

export type PillOption<T extends string> = {
    value: T
    label: string
}

export type PillVariant = "chip" | "ghost" | "inset"

/**
 * `chip` is the selector shown above the composer, `inset` the raised one that
 * sits inside the composer's toolbar, and `ghost` a borderless inline control.
 */
const TRIGGER_VARIANTS: Record<PillVariant, string> = {
    chip: "cursor-pointer border border-transparent px-2.5 py-1.5 font-medium text-textVar1 hover:bg-bgVar2 hover:text-text",
    inset: "cursor-pointer border border-bg bg-bgVar1 px-2.5 py-1.5 font-medium text-textVar1 hover:border-textVar1/40 hover:text-text",
    ghost: "cursor-pointer px-2 py-1 text-textVar1 hover:text-text",
}

type PillSelectProps<T extends string> = {
    value: T
    options: readonly PillOption<T>[]
    onChange: (value: T) => void
    ariaLabel: string
    icon?: ReactNode
    variant?: PillVariant
    align?: "start" | "end"
    className?: string
    /**
     * Renders the trigger inert. Used when a selector does not apply to the
     * current scope (clans have no region or bracket).
     */
    disabled?: boolean
}

/**
 * Small single-select dropdown used by the landing composer.
 *
 * Deliberately dependency-free: the app already ships `react-select` for forms,
 * but here the trigger has to read as a pill/chip, so a button plus an
 * absolutely positioned list is both smaller and easier to style with the
 * Corehalla tokens.
 */
export const PillSelect = <T extends string>({
    value,
    options,
    onChange,
    ariaLabel,
    icon,
    variant = "chip",
    align = "start",
    className,
    disabled,
}: PillSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen) return

        const onPointerDown = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false)
        }

        document.addEventListener("pointerdown", onPointerDown)
        document.addEventListener("keydown", onKeyDown)

        return () => {
            document.removeEventListener("pointerdown", onPointerDown)
            document.removeEventListener("keydown", onKeyDown)
        }
    }, [isOpen])

    const selected = options.find((option) => option.value === value)

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <button
                type="button"
                aria-label={ariaLabel}
                aria-expanded={isOpen}
                disabled={disabled}
                onClick={() => setIsOpen((open) => !open)}
                className={cn(
                    "flex items-center gap-2 rounded-lg text-sm transition-colors",
                    TRIGGER_VARIANTS[variant],
                    {
                        "text-text": isOpen,
                        "border-bg bg-bgVar2": isOpen && variant === "chip",
                        "border-textVar1/40": isOpen && variant === "inset",
                        "pointer-events-none opacity-40": disabled,
                    },
                )}
            >
                {icon}
                <span className="whitespace-nowrap">
                    {selected?.label ?? value}
                </span>
                <HiChevronDown
                    className={cn("h-3.5 w-3.5 shrink-0 transition-transform", {
                        "rotate-180": isOpen,
                    })}
                />
            </button>
            {isOpen && (
                <ul
                    aria-label={ariaLabel}
                    className={cn(
                        "absolute z-30 mt-1 max-h-64 min-w-44 list-none overflow-y-auto rounded-xl border border-bg bg-bgVar2 p-1 shadow-xl",
                        align === "end" ? "right-0" : "left-0",
                    )}
                >
                    {options.map((option) => {
                        const isSelected = option.value === value

                        return (
                            <li key={option.value}>
                                <button
                                    type="button"
                                    aria-current={
                                        isSelected ? "true" : undefined
                                    }
                                    onClick={() => {
                                        onChange(option.value)
                                        setIsOpen(false)
                                    }}
                                    className={cn(
                                        "flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                                        isSelected
                                            ? "bg-bg text-text"
                                            : "text-textVar1 hover:bg-bg/60 hover:text-text",
                                    )}
                                >
                                    <span>{option.label}</span>
                                    {isSelected && (
                                        <HiCheck className="h-4 w-4 shrink-0 text-accent" />
                                    )}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
