import { Fragment, useContext } from 'react';
import { MapNodesContext } from '../providers/MapNodesProvider';
import { Button } from './Button';

export function CollisionSettings() {
	const { selectedCollision: col, updateCollision } = useContext(
		MapNodesContext
	);

	return col ? (
		<div>
			<div>
				<p>Selected Collision</p>
				<p>ID:{col.id}</p>
			</div>
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
					<Button
						key={type}
						name='radio'
						value={type}
						onClick={() =>
							updateCollision(col.id, () => ({ type }))
						}
					>
						{type}
					</Button>
				))}
			</div>
		</div>
	) : null;
}
