"use client"

import React from "react"

import { Trans as BaseTrans, type TransProps } from "@lingui/react"

export const Trans = (props: TransProps) => {
    return <BaseTrans {...props} />
}
