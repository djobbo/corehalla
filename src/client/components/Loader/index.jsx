import React from 'react';
import './styles.scss';

export default () => (
	<div className='loader'>
		<div className='lds-ellipsis'>
			<div />
			<div />
			<div />
			<div />
		</div>
	</div>
);
