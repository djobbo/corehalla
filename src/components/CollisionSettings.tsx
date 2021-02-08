import formStyles from '../styles/Forms.module.scss';
import { useContext } from 'react';
import { MapNodesContext } from '../providers/MapNodesProvider';

interface Props {
	col: Collision;
}

export function CollisionSettings({ col }: Props) {
	const { updateCollision } = useContext(MapNodesContext);

	return col ? (
		<div className={formStyles.formContainer}>
			{['x1', 'y1', 'x2', 'y2'].map(
				(coord: 'x1' | 'y1' | 'x2' | 'y2') => (
					<label className={formStyles.inlineLabel} key={coord}>
						{coord.toUpperCase()}
						<input
							className={formStyles.input}
							value={col[coord]}
							type='number'
							onChange={(e) =>
								updateCollision(col.id, () => ({
									[coord]: parseInt(e.target.value),
								}))
							}
						/>
					</label>
				)
			)}
			<label className={formStyles.inlineLabel}>
				Type
				<div>
					{['Hard', 'Soft'].map((type: 'Hard' | 'Soft') => (
						<button
							key={type}
							name='radio'
							value={type}
							className={`${formStyles.radio} ${
								col.type === type ? formStyles.selected : ''
							} ${
								type === 'Hard'
									? formStyles.left
									: formStyles.right
							}`}
							onClick={() =>
								updateCollision(col.id, () => ({ type }))
							}
						>
							{type}
						</button>
					))}
				</div>
			</label>
		</div>
	) : null;
}
