import styles from './index.module.scss';
// Library imports
import { useContext, SetStateAction, Dispatch, useRef, useEffect } from 'react';

// Context imports
import { PlayerSearchContext } from '~providers/PlayerSearchProvider';
import { CloseIcon } from '@Icons';

interface Props {
	setShowSearch: Dispatch<SetStateAction<boolean>>;
}

export function SearchBar({ setShowSearch }: Props) {
	const { setPlayerSearch } = useContext(PlayerSearchContext);
	const inputRef = useRef<HTMLInputElement>();

	useEffect(() => {
		inputRef.current.focus();
	}, []);

	return (
		<div className={styles.container}>
			<input
				className={styles.input}
				ref={inputRef}
				type='text'
				onChange={(e) => {
					setPlayerSearch(e.target.value);
				}}
			/>
			<a
				href='#'
				onClick={(e) => {
					e.preventDefault();
					setShowSearch(false);
				}}
			>
				{CloseIcon}
			</a>
		</div>
	);
}
