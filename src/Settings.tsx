import { Button } from "@/components/ui/button";
import { LucideArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Yeah from "./components/Yeah";
import DefaultSearchEngine from "./components/settings/DefaultSearchEngine";
import SymbolCall from "./components/settings/SymbolCall";
import FirstPositionCall from "./components/settings/FirstPositionCall";
import DdgBangsPresets from "./components/settings/DdgBangsPresets";
import CustomBangs from "./components/settings/CustomBangs";
import { useSettings } from "./context/SettingsContext";

export default function Settings() {
  const {
    defaultEngine,
    setdefaultEngine,
    useCallSymbol,
    setUseCallSymbol,
    forceFirstBang,
    setforceFirstBang,
  } = useSettings();

  return (
    <div className="flex flex-col items-center min-h-screen py-8">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-2xl flex flex-col gap-4 px-4">
        <div className="flex flex-row justify-between items-center border rounded-lg p-2 sticky top-4 bg-background/40 backdrop-blur-sm z-10">
          <Link to="/">
            <Button variant="outline">
              <LucideArrowLeft />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
          <Yeah />
        </div>
        <DefaultSearchEngine
          searchEngine={defaultEngine}
          setsearchEngine={setdefaultEngine}
        />
        <SymbolCall
          useCallSymbol={useCallSymbol}
          setUseCallSymbol={setUseCallSymbol}
        />
        <FirstPositionCall
          useFirstPosition={forceFirstBang}
          setuseFirstPosition={setforceFirstBang}
          callExclamation={useCallSymbol}
        />
        <DdgBangsPresets />
        <CustomBangs />
        <h1 className="text-sm text-center opacity-75 mb-4">
          Copyright &copy; 2025 Ferdinan Iydheko
        </h1>
      </div>
    </div>
  );
}
