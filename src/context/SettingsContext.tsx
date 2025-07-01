import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { db } from "../db";
import { bangs as ddgBangsData } from "../data/bang";

type SettingsContextType = {
  defaultEngine: string;
  setdefaultEngine: (engine: string) => void;
  useCallSymbol: string;
  setUseCallSymbol: (exclamation: string) => void;
  forceFirstBang: string;
  setforceFirstBang: (force: string) => void;
  ddgPresets: string;
  setddgPresets: (presets: string) => void;
  ddgBangs: typeof ddgBangsData; // Inject langsung dari static import
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [defaultEngine, setdefaultEngineState] = useState<string | null>(null);
  const [useCallSymbol, setUseCallSymbol] = useState<string | null>(
    null,
  );
  const [forceFirstBang, setforceFirstBangState] = useState<string | null>(
    null,
  );
  const [ddgPresets, setddgPresetsState] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await db.settings.toArray();
        const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

        setdefaultEngineState(
          settingsMap.get("cuzbangs.default_engine") ||
            "https://www.google.com/search?q=%s",
        );
        setUseCallSymbol(
          settingsMap.get("cuzbangs.symbol_call") || "!",
        );
        setforceFirstBangState(
          settingsMap.get("cuzbangs.first_position_call") || "false",
        );
        setddgPresetsState(
          settingsMap.get("duckduckgo.bangs_presets") || "true",
        );
      } catch (error) {
        console.error("Failed to load settings from Dexie:", error);
        setdefaultEngineState("https://www.google.com/search?q=%s");
        setUseCallSymbol("!");
        setforceFirstBangState("false");
        setddgPresetsState("true");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const setdefaultEngine = useCallback((engine: string) => {
    setdefaultEngineState(engine);
    db.settings.put({ key: "cuzbangs.default_engine", value: engine });
  }, []);

  const setcallSymbol = useCallback((symbol: string) => {
    setUseCallSymbol(symbol);
    db.settings.put({ key: "cuzbangs.symbol_call", value: symbol });
  }, []);

  const setforceFirstBang = useCallback((force: string) => {
    setforceFirstBangState(force);
    db.settings.put({ key: "cuzbangs.first_position_call", value: force });
  }, []);

  const setddgPresets = useCallback((presets: string) => {
    setddgPresetsState(presets);
    db.settings.put({ key: "duckduckgo.bangs_presets", value: presets });
  }, []);

  const value: SettingsContextType = {
    defaultEngine: defaultEngine!,
    setdefaultEngine,
    useCallSymbol: useCallSymbol!,
    setUseCallSymbol: setcallSymbol,
    forceFirstBang: forceFirstBang!,
    setforceFirstBang,
    ddgPresets: ddgPresets!,
    setddgPresets,
    ddgBangs: ddgBangsData,
  };

  if (isLoading) return null;

  return (
    <SettingsContext.Provider value={value}>
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
