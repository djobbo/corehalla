import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export function Button(props: ButtonHTMLAttributes<{}>) {
	return (
		<button
			className='bg-purple-500 px-5 py-2 rounded-sm m-2 uppercase text-white border-b border-purple-600 hover:bg-purple-600 hover:border-purple-800'
			{...props}
		/>
	);
}
