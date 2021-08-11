export interface Props {
    width: number | string
    height: number | string
}

export type IconComponent = (props: Props) => JSX.Element
