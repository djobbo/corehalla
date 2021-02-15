import { useState, createContext, PropsWithChildren } from 'react';

interface ISideNavContext {
	sideNavOpen: boolean;
	setSideNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SideNavContext = createContext<ISideNavContext>({
	sideNavOpen: false,
	setSideNavOpen: () => {},
});

export function SideNavProvider({ children }: PropsWithChildren<{}>) {
	const [sideNavOpen, setSideNavOpen] = useState(false);

	return (
		<SideNavContext.Provider value={{ sideNavOpen, setSideNavOpen }}>
			{children}
		</SideNavContext.Provider>
	);
}
