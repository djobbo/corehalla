import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export type MetaCsvDownloadProps = {
    readonly filename: string
    readonly csv: string
}

export const MetaCsvDownload = ({ filename, csv }: MetaCsvDownloadProps) => {
    const download = () => {
        const url = URL.createObjectURL(
            new Blob([csv], { type: "text/csv;charset=utf-8" }),
        )
        const link = document.createElement("a")

        link.href = url
        link.download = filename
        link.click()

        window.setTimeout(() => URL.revokeObjectURL(url), 0)
    }

    return (
        <Button type="button" variant="outline" size="sm" onClick={download}>
            <Download aria-hidden="true" />
            Download CSV
        </Button>
    )
}
