import { Image } from 'react-konva'
import useImage from 'use-image'

interface Props extends PlatformBase {
    url: string
}

export function URLImage({ url, x, y, w, h, scaleX, scaleY, rotation }: Props): JSX.Element {
    const [img] = useImage(url)

    return <Image image={img} x={x} y={y} width={w} height={h} scaleX={scaleX} scaleY={scaleY} rotation={rotation} />
}
