import { PropsWithChildren, useContext, useState } from 'react';
import { MapNodesContext } from '../providers/MapNodesProvider';
import styles from '../styles/TreeView.module.scss';
import { CollisionSettings } from './CollisionSettings';

function TreeNode({
	children,
	title,
	onClick,
}: PropsWithChildren<{ title: string; onClick?: () => void }>) {
	const [isVisible, setIsVisible] = useState(false);
	console.log('onclick', onClick);

	return (
		<>
			<p
				className={styles.treeNode}
				onClick={() => (onClick ? onClick() : setIsVisible((v) => !v))}
			>
				<svg
					className={styles.treeNodeIcon}
					width='80'
					height='80'
					viewBox='0 0 80 80'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					{isVisible ? (
						<>
							<path d='M16.1039 40.3093C17.241 37.1254 20.257 35 23.6379 35H68.3241C71.0902 35 73.0214 37.7404 72.0911 40.3453L64.9482 60.3453C64.3796 61.9373 62.8717 63 61.1812 63H10.8381C9.45505 63 8.48946 61.6298 8.95463 60.3273L16.1039 40.3093Z' />
							<path d='M8.91167 61.5423C8.34209 60.8511 8 59.9655 8 59V21C8 18.7909 9.79086 17 12 17H23.0318C24.322 17 25.533 17.6223 26.2841 18.6713L30.4757 24.5254C30.689 24.8233 31.0329 25 31.3992 25H60C62.2091 25 64 26.7909 64 29V35' />
							<path d='M13 49V34C13 31.7909 14.7909 30 17 30H55C57.2091 30 59 31.7909 59 34V35' />
						</>
					) : (
						<>
							<path
								fill-rule='evenodd'
								clip-rule='evenodd'
								d='M16 17C13.7909 17 12 18.7909 12 21L12 29L12 45L12 59C12 61.2091 13.7909 63 16 63L64 63C66.2091 63 68 61.2091 68 59V29C68 26.7909 66.2091 25 64 25L35.3992 25C35.0329 25 34.689 24.8233 34.4757 24.5254L34.1359 24.0508L33.7597 23.5254L33.3835 23L30.2841 18.6713C29.533 17.6223 28.322 17 27.0318 17L16 17Z'
							/>
							<path d='M34.1359 24.0508L35.7621 22.8865L34.1359 24.0508ZM33.7597 23.5254L32.1336 24.6898V24.6898L33.7597 23.5254ZM33.3835 23L35.0096 21.8357V21.8357L33.3835 23ZM30.2841 18.6713L31.9102 17.507L31.9102 17.507L30.2841 18.6713ZM14 21C14 19.8954 14.8954 19 16 19V15C12.6863 15 10 17.6863 10 21H14ZM14 29L14 21H10L10 29H14ZM14 45L14 29H10L10 45H14ZM14 59L14 45H10L10 59H14ZM16 61C14.8954 61 14 60.1046 14 59H10C10 62.3137 12.6863 65 16 65V61ZM64 61L16 61V65H64V61ZM66 59C66 60.1046 65.1046 61 64 61V65C67.3137 65 70 62.3137 70 59H66ZM66 29V59H70V29H66ZM64 27C65.1046 27 66 27.8954 66 29H70C70 25.6863 67.3137 23 64 23V27ZM35.3992 27L64 27V23L35.3992 23V27ZM32.5098 25.2152L32.8496 25.6898L36.1019 23.3611L35.7621 22.8865L32.5098 25.2152ZM32.1336 24.6898L32.5098 25.2152L35.7621 22.8865L35.3858 22.3611L32.1336 24.6898ZM31.7574 24.1643L32.1336 24.6898L35.3858 22.3611L35.0096 21.8357L31.7574 24.1643ZM28.6579 19.8357L31.7574 24.1643L35.0096 21.8357L31.9102 17.507L28.6579 19.8357ZM27.0318 19C27.6769 19 28.2824 19.3112 28.6579 19.8357L31.9102 17.507C30.7835 15.9335 28.9671 15 27.0318 15V19ZM16 19L27.0318 19V15L16 15V19ZM35.3992 23C35.678 23 35.9396 23.1344 36.1019 23.3611L32.8496 25.6898C33.4384 26.5121 34.3878 27 35.3992 27V23Z' />
						</>
					)}
				</svg>
				{title}
			</p>
			{isVisible && (
				<div className={styles.treeNodeContainer}>{children}</div>
			)}
		</>
	);
}

export function TreeView() {
	const { mapData } = useContext(MapNodesContext);

	return (
		<div className={styles.container}>
			<TreeNode title='Level'>
				<TreeNode title='Animations'>
					{mapData.animations.map((anim) => (
						<TreeNode
							title={`PlatID ${anim.platId}`}
							key={anim.platId}
						>
							{anim.keyframes.map((key) =>
								key.type === 'Keyframe' ? (
									<TreeNode
										title={`Key ${key.frameNum}`}
										key={key.frameNum}
									/>
								) : (
									<TreeNode title={`Phase ${key.frameNum}`}>
										{key.keyFrames.map((k) => (
											<TreeNode
												title={`Key {k.frameNum}`}
												key={k.frameNum}
												children={undefined}
											/>
										))}
									</TreeNode>
								)
							)}
						</TreeNode>
					))}
				</TreeNode>
				<TreeNode title='Collisions'>
					{mapData.collisions.map((col) => (
						<TreeNode title={`ColID ${col.id}`} key={col.id}>
							<CollisionSettings col={col} />
						</TreeNode>
					))}
				</TreeNode>
				<TreeNode title='Dynamic Collisions'>
					{mapData.dynamicCollisions.map((dynCol) => (
						<TreeNode title={`PlatID ${dynCol.platId}`}>
							{dynCol.collisions.map((col) => (
								<TreeNode title={col.id} key={col.id} />
							))}
						</TreeNode>
					))}
				</TreeNode>
				<TreeNode title='Platforms'>
					{mapData.platforms.map((plat) => (
						<TreeNode title={`PlatID ${plat.id}`}>
							{plat.platforms.map((childPlat) => (
								<TreeNode title={childPlat.id} /> //TODO: ++ recursion
							))}
						</TreeNode>
					))}
				</TreeNode>
				<TreeNode title='Moving Platforms'>
					{mapData.movingPlatforms.map((movPlat) => (
						<TreeNode
							title={`PlatID ${movPlat.id}`}
							key={movPlat.id}
						>
							{movPlat.platforms.map((childPlat) => (
								<TreeNode title={childPlat.id} /> //TODO: ++ recursion
							))}
						</TreeNode>
					))}
				</TreeNode>
			</TreeNode>
		</div>
	);
}
