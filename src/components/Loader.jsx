import React from 'react';
import './Loader/styles.css';

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
