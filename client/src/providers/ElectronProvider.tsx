import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from 'react';

const ElectronContext = createContext(false);

export const useElectron = () => useContext(ElectronContext);

export function ElectronProvider({
	children,
	xd,
}: PropsWithChildren<{ xd: string }>) {
	const [isElectron, setIsElectron] = useState(false);

	useEffect(() => {
		const userAgent = navigator.userAgent.toLowerCase();
		setIsElectron(userAgent.indexOf(' electron/') > -1);
	}, []);

	return (
		<ElectronContext.Provider value={isElectron}>
			{children}
		</ElectronContext.Provider>
	);
}
