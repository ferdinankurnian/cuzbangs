import { createContext, useContext, useEffect, useState } from "react";
import { syncBangs } from "@/lib/bangs-sync";
import { db } from "@/lib/db";

type AppContextType = {
	isConsented: boolean;
	acceptConsent: () => void;
	nukeCuzbangs: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
	const [isConsented, setIsConsented] = useState<boolean>(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("cuzbangs-consent") === "true";
		}
		return false;
	});

	useEffect(() => {
		if (isConsented) {
			syncBangs();
		}
	}, [isConsented]);

	const acceptConsent = () => {
		setIsConsented(true);
		localStorage.setItem("cuzbangs-consent", "true");
	};

	const nukeCuzbangs = async () => {
		setIsConsented(false);
		localStorage.clear();
		sessionStorage.clear();
		document.cookie.split(";").forEach((cookie) => {
			const [rawName] = cookie.split("=");
			const name = rawName?.trim();
			if (!name) return;
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
		});

		await Promise.all([
			db.delete(),
			caches
				.keys()
				.then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
			navigator.serviceWorker
				.getRegistrations()
				.then((registrations) =>
					Promise.all(registrations.map((registration) => registration.unregister())),
				),
		]);
	};

	return (
		<AppContext.Provider value={{ isConsented, acceptConsent, nukeCuzbangs }}>
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
