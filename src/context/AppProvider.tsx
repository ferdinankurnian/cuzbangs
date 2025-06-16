import { type ReactNode } from "react";
import { SettingsProvider } from "./SettingsContext";
import { BangsProvider } from "./BangsContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <BangsProvider>{children}</BangsProvider>
    </SettingsProvider>
  );
}
