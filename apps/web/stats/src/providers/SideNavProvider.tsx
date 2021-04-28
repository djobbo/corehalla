import { useState, createContext, PropsWithChildren, useContext } from 'react';

interface ISideNavContext {
	sideNavOpen: boolean;
	setSideNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideNavContext = createContext<ISideNavContext>({
	sideNavOpen: false,
	setSideNavOpen: () => {},
});

export const useSideNavContext = () => useContext(SideNavContext);

export function SideNavProvider({ children }: PropsWithChildren<{}>) {
	const [sideNavOpen, setSideNavOpen] = useState(false);

	return (
		<SideNavContext.Provider value={{ sideNavOpen, setSideNavOpen }}>
			{children}
		</SideNavContext.Provider>
	);
}
