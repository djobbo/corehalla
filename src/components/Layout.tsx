import { PropsWithChildren } from 'react';

interface Props {}

export function Layout({ children }: PropsWithChildren<Props>) {
	return <div>{children}</div>;
}
