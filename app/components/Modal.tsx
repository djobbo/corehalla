"use client"

import { type ReactNode } from "react"
import { useRouter } from "next/navigation"

type ModalProps = {
    children: ReactNode
}

export const Modal = ({ children }: ModalProps) => {
    const router = useRouter()

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <button
                className="fixed inset-0 bg-bgVar2 opacity-50 -z-10"
                onClick={() => router.back()}
            />
            <div className="mt-24 mb-8 p-4 bg-bgVar2 max-w-screen-xl mx-auto border border-border rounded-xl">
                {children}
            </div>
        </div>
    )
}
