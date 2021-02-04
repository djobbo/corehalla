import { Fragment, useContext } from 'react';
import { MapNodesContext } from '../providers/MapNodesProvider';
import InputGroup from 'react-bootstrap/InputGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import FormControl from 'react-bootstrap/FormControl';

export function CollisionSettings() {
	const { selectedCollision: col, updateCollision } = useContext(
		MapNodesContext
	);

	return col ? (
		<div>
			<InputGroup className='mb-3'>
				<InputGroup.Prepend>
					<InputGroup.Text id='basic-addon1'>
						{col.id}
					</InputGroup.Text>
				</InputGroup.Prepend>
			</InputGroup>
			<InputGroup className='mb-3'>
				{['x1', 'y1', 'x2', 'y2'].map(
					(coord: 'x1' | 'y1' | 'x2' | 'y2') => (
						<Fragment key={coord}>
							<InputGroup.Prepend>
								<InputGroup.Text>
									{coord.toUpperCase()}
								</InputGroup.Text>
							</InputGroup.Prepend>
							<FormControl
								value={col[coord]}
								type='number'
								onChange={(e) =>
									updateCollision(col.id, {
										[coord]: parseInt(e.target.value),
									})
								}
							/>
						</Fragment>
					)
				)}
			</InputGroup>
			<InputGroup className='mb-3'>
				<InputGroup.Prepend>
					<InputGroup.Text>Collision Type</InputGroup.Text>
				</InputGroup.Prepend>
				<ButtonGroup toggle>
					{['Hard', 'Soft'].map((type: 'Hard' | 'Soft') => (
						<ToggleButton
							key={type}
							type='radio'
							variant='secondary'
							name='radio'
							value={type}
							checked={col.type === type}
							onChange={() => updateCollision(col.id, { type })}
						>
							{type}
						</ToggleButton>
					))}
				</ButtonGroup>
			</InputGroup>
		</div>
	) : null;
}
