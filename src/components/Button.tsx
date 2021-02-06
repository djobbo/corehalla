import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export function Button(props: ButtonHTMLAttributes<{}>) {
	return <button {...props} />;
}
