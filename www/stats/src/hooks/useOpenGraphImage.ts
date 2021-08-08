import { useRouter } from 'next/router'

export const useOpenGraphImage = (): { ogImageURL: string } => {
    const { asPath } = useRouter()

    const ogImageURL = `/api/open-graph-image?path=/open-graph${asPath}`
    return { ogImageURL }
}
