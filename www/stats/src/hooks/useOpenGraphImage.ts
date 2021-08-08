import { useRouter } from 'next/router'

import { getAbsoluteURL } from '~util/getAbsoluteURL'

export const useOpenGraphImage = (): { imageURL: string } => {
    const { asPath } = useRouter()
    const searchParams = new URLSearchParams()

    console.log({ asPath })

    searchParams.set('path', `/open-graph/${asPath}`)

    const fullImageURL = getAbsoluteURL(`/api/open-graph-image?${searchParams}`)
    return { imageURL: fullImageURL }
}
