import { useConvex } from "convex/react";
import { createContext, useContext, useEffect, useState } from "react";
import { syncBangs } from "@/lib/bangs-sync";
import { db } from "@/lib/db";

type AppContextType = {
	isConsented: boolean;
	acceptConsent: () => void;
	resetData: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
	const convex = useConvex();
	const [isConsented, setIsConsented] = useState<boolean>(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("cuzbangs-consent") === "true";
		}
		return false;
	});

	useEffect(() => {
		if (isConsented) {
			syncBangs(convex);
		}
	}, [isConsented, convex]);

	const acceptConsent = () => {
		setIsConsented(true);
		localStorage.setItem("cuzbangs-consent", "true");
	};

	const resetData = async () => {
		setIsConsented(false);
		localStorage.removeItem("cuzbangs-consent");
		await Promise.all([
			db.storeBangs.clear(),
			db.userBangs.clear(),
			db.configs.clear(),
			db.pings.clear(),
		]);
	};

	return (
		<AppContext.Provider value={{ isConsented, acceptConsent, resetData }}>
			{children}
		</AppContext.Provider>
	);
}

export const useApp = () => {
	const context = useContext(AppContext);
	if (context === undefined) {
		throw new Error("useApp must be used within an AppProvider");
	}
	return context;
};
