import {
	DetailedHTMLProps,
	HTMLAttributes,
	PropsWithChildren,
	useContext,
	useState,
} from 'react';
import { MapNodesContext } from '../providers/MapNodesProvider';
import styles from '../styles/TreeView.module.scss';
import { CollisionSettings } from './CollisionSettings';

// function TreeNode({
// 	children,
// 	onClick,
// }: DetailedHTMLProps<
// 	HTMLAttributes<HTMLParagraphElement>,
// 	HTMLParagraphElement
// >) {
// 	return (
// 		<p onClick={onClick} className={styles.treeNode}>
// 			{children}
// 		</p>
// 	);
// }

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
