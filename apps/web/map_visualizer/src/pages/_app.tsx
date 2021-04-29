import '../styles/globals.scss';
import '../styles/code.scss';

import type { AppProps } from 'next/app';
import { MapNodesProvider } from '../providers/MapNodesProvider';
import { EditorStateProvider } from '../providers/EditorStateProvider';
import { ElectronProvider } from '../providers/ElectronProvider';

import { AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { Component, Context, PropsWithChildren } from 'react';

type Tuple<
	T extends unknown = undefined,
	U extends [unknown, ...unknown[]] | unknown | undefined = undefined
> = T extends undefined
	? []
	: U extends undefined
	? [T]
	: U extends [unknown, ...unknown[]]
	? [T, ...Tuple<U[0], U[1]>]
	: [T];

type Tuple3<T> = T extends undefined
	? []
	: T extends [infer A, ...infer R]
	? [A, ...Tuple3<R>]
	: T extends undefined
	? never
	: T;

let a: Tuple<number, [number, [string, [{ xd: 'lol' }]]]> = [
	1,
	10,
	'asdasd',
	{ xd: 'lol' },
];

let b: Tuple3<[number, number, string, { xd: 'lol' }]> = [
	1,
	10,
	'asdasd',
	{ xd: 'lol' },
];

const tup = <
	T extends (
		| {
				component: (props: unknown) => JSX.Element;
				props?: unknown;
		  }
		| (({}: PropsWithChildren<{}>) => JSX.Element)
	)[]
>(
	...args: T
) => args;

type ProviderWithProps<T = undefined> = T extends undefined
	? (props: PropsWithChildren<{}>) => JSX.Element
	: {
			component: (props: PropsWithChildren<T>) => JSX.Element;
			props: T;
	  };

const combineProviders = <
	Props extends unknown[],
	T extends ProviderWithProps<Props>[]
>(
	...providers: T
) => {
	return ({ children }: PropsWithChildren<{}>) =>
		providers.reduce<ProviderWithProps>(
			(Combined, Component) => {
				if (typeof Component === 'function') {
					Component;
					return () => (
						<Combined>
							<Component />
						</Combined>
					);
				} else {
					const { component: Provider, props } = Component;
					return () => (
						<Combined>
							<Provider {...props}>{children}</Provider>
						</Combined>
					);
				}
			},
			() => <></>
		)({ children });
};

combineProviders(MapNodesProvider, { component: ElectronProvider, props: {} });

function MyApp({ Component, pageProps, router }: AppProps) {
	return (
		<AnimateSharedLayout>
			<EditorStateProvider>
				<MapNodesProvider>
					<AnimatePresence exitBeforeEnter>
						<Component {...pageProps} key={router.route} />
					</AnimatePresence>
				</MapNodesProvider>
			</EditorStateProvider>
		</AnimateSharedLayout>
	);
}

export default MyApp;
