import { Button } from "@/components/ui/button";
import { LucideArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Yeah from "../components/Yeah";
import DefaultSearchEngine from "./settings/DefaultSearchEngine";
import SymbolCall from "./settings/SymbolCall";
import FirstPositionCall from "./settings/FirstPositionCall";
import DdgBangsPresets from "./settings/DdgBangsPresets";
import CustomBangs from "./settings/CustomBangs";
import { useSettings } from "../context/SettingsContext";
import ImportExport from "./settings/ImportExport";
import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Settings() {

  useEffect(() => {
    document.title = "Settings - cuzbangs";
  }, []);

  const {
    useCallSymbol,
    setUseCallSymbol,
    forceFirstBang,
    setforceFirstBang,
  } = useSettings();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
      <ScrollArea className="h-screen w-full px-4 relative">
        <div className="grid grid-cols-3 items-center border rounded-lg p-2 absolute top-4 bg-background/40 backdrop-blur-sm z-10">
          <Link to="/">
            <Button variant="outline">
              <LucideArrowLeft />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-center">Settings</h1>
          <Yeah />
        </div>
        <div className="flex flex-col gap-4 mt-7">
          <ImportExport />
          <DefaultSearchEngine />
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
      </ScrollArea>
      <div className="md:border-l h-screen p-4 pt-6">
        <h1 className="text-2xl font-bold">Bangs</h1>
      </div>
    </div>
  );
}
