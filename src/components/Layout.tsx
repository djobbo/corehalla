import { PropsWithChildren, useContext } from 'react';
import { MapNodesContext } from '../providers/MapNodesProvider';

interface Props {}

export function Layout({ children }: PropsWithChildren<Props>) {
	const { mapData } = useContext(MapNodesContext);

	return (
		<div
			style={{
				backgroundImage: `url(/mapArt/Backgrounds/${mapData.background})`,
			}}
		>
			{children}
		</div>
	);
}
