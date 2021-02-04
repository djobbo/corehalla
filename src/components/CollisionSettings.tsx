import { Fragment, useContext } from 'react';
import { MapNodesContext } from '../providers/MapNodesProvider';
import { Button } from './Button';

export function CollisionSettings() {
	const { selectedCollision: col, updateCollision } = useContext(
		MapNodesContext
	);

	return col ? (
		<div className='flex flex-col border-b border-gray-400 mx-2 mb-8 pb-8'>
			<div>
				<p className='text-md text-gray-600 font-bold mx-2 mt-4 uppercase'>
					Selected Collision
				</p>
				<p className='text-xl text-gray-600 font-bold mx-2 mb-4'>
					ID:{col.id}
				</p>
			</div>
			<div className='mb-1 inline-flex flex-col'>
				{['x1', 'y1', 'x2', 'y2'].map(
					(coord: 'x1' | 'y1' | 'x2' | 'y2') => (
						<div
							className='inline-flex border border-gray-300 rounded-sm mx-2 mb-1'
							key={coord}
						>
							<p className='bg-gray-200 py-2 px-3 mr-2'>
								{coord.toUpperCase()}
							</p>
							<input
								className='flex-1 focus:outline-none'
								value={col[coord]}
								type='number'
								onChange={(e) =>
									updateCollision(col.id, {
										[coord]: parseInt(e.target.value),
									})
								}
							/>
						</div>
					)
				)}
			</div>
			<div className='inline-flex border border-gray-300 rounded-sm mx-2'>
				<p className='bg-gray-200 py-2 px-3'>Collision Type</p>

				{['Hard', 'Soft'].map((type: 'Hard' | 'Soft') => (
					<Button
						key={type}
						name='radio'
						value={type}
						className={`px-4 py-1 focus:outline-none flex-1 ${
							col.type === type ? 'bg-purple-500' : ''
						}`}
						onClick={() => updateCollision(col.id, { type })}
					>
						{type}
					</Button>
				))}
			</div>
		</div>
	) : null;
}
