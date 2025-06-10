import { createContext, useContext, useState, type ReactNode } from "react";

export interface Setting {
  key: string;
  value: string;
}

type SettingsContextType = {
  settings: Setting[];
  updateSettings: (settings: Setting[]) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Setting[]>([]);

  const updateSettings = (newSettings: Setting[]) => {
    setSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context)
    throw new Error("useSettings should be used within a SettingsProvider");
  return context;
}
