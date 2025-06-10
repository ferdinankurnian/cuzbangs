import { type ReactNode } from "react";
import { SettingsProvider } from "./SettingsContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}
