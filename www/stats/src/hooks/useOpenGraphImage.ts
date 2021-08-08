import { useRouter } from 'next/router'

import { getAbsoluteURL } from '~util/getAbsoluteURL'

export const useOpenGraphImage = (): { ogImageURL: string } => {
    const { asPath } = useRouter()

    const ogImageURL = getAbsoluteURL(`/api/open-graph-image?path=/open-graph${asPath}`)
    return { ogImageURL }
}
