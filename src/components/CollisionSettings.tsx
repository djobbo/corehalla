import formStyles from '../styles/Forms.module.scss';
import { useContext } from 'react';
import { MapNodesContext } from '../providers/MapNodesProvider';

interface Props {
	col: Collision;
}

export function CollisionSettings({ col }: Props) {
	const { updateCollision } = useContext(MapNodesContext);

	return col ? (
		<div>
			<div>
				{['x1', 'y1', 'x2', 'y2'].map(
					(coord: 'x1' | 'y1' | 'x2' | 'y2') => (
						<div key={coord}>
							<p>{coord.toUpperCase()}</p>
							<input
								value={col[coord]}
								type='number'
								onChange={(e) =>
									updateCollision(col.id, () => ({
										[coord]: parseInt(e.target.value),
									}))
								}
							/>
						</div>
					)
				)}
			</div>
			<div>
				<p>Collision Type</p>

				{['Hard', 'Soft'].map((type: 'Hard' | 'Soft') => (
					<button
						key={type}
						name='radio'
						value={type}
						className={`${formStyles.button} ${
							col.type === type ? formStyles.selected : ''
						}`}
						onClick={() =>
							updateCollision(col.id, () => ({ type }))
						}
					>
						{type}
					</button>
				))}
			</div>
		</div>
	) : null;
}
