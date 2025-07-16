import {
    OptionCard,
    OptionCardHeader,
    OptionCardTitleArea,
    OptionCardTitle,
    OptionCardDescription,
    OptionCardContent,
} from "@/components/OptionCard";
import { useState, useRef, useEffect } from "react";
import { handleChange, handleImport } from "@/lib/importSettings";
import { handleExport } from "@/lib/exportSettings";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSettings } from "@/context/SettingsContext";
import { useBangsContext } from "@/context/BangsContext";
import { DownloadIcon, UploadIcon } from "lucide-react";
import { type Bangs } from "@/db";
  
export default function ImportExport() {
  const {
    setdefaultEngine,
    setUseCallSymbol,
    setforceFirstBang,
    setddgPresets,
    defaultEngine,
    useCallSymbol,
    forceFirstBang,
    ddgPresets,
  } = useSettings();

  const { bangsTabs, deleteBangs, addBangs } = useBangsContext();
  const [fileName, setFileName] = useState<string>("");  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!fileName) return;

    const timer = setTimeout(() => setFileName(""), 5000);
    return () => clearTimeout(timer);
  }, [fileName]);

  const voidAddBangs = async (bang: Bangs) => {
    const { id, ...rest } = bang;
    await addBangs(rest);
  };

  const importProps = {
    bangsTabs,
    addBangs: voidAddBangs,
    deleteBangs,
    setdefaultEngine,
    setUseCallSymbol,
    setforceFirstBang,
    setddgPresets,
    toast,
    setFileName,
  };

  const exportProps = {
    defaultEngine,
    useCallSymbol,
    forceFirstBang,
    ddgPresets,
    bangsTabs,
    toast,
  };

  return (
    <OptionCard>
      <OptionCardHeader>
        <OptionCardTitleArea>
          <OptionCardTitle>Import / Export Settings</OptionCardTitle>
          <OptionCardDescription>
            <p className="text-sm opacity-75">
              Import or export your settings with a cuzbangs JSON file.
            </p>
          </OptionCardDescription>
        </OptionCardTitleArea>
      </OptionCardHeader>
      <OptionCardContent>
          <div className="flex flex-col md:flex-row gap-2">
              <Button variant="outline" size="sm" onClick={() => handleImport({ fileInputRef })}>
                  <UploadIcon className="w-4 h-4" /> Import from JSON
              </Button>
              
              <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={(e) => handleChange({ e, ...importProps })}
              />

              <Button variant="outline" size="sm" onClick={() => handleExport(exportProps)}>
                  <DownloadIcon className="w-4 h-4" /> Download as JSON
              </Button>
          </div>

          {fileName && (
              <p className="text-xs opacity-70 mt-2">Selected file: {fileName}</p>
          )}
      </OptionCardContent>
    </OptionCard>
  );
}