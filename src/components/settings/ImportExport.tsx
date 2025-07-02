import {
    OptionCard,
    OptionCardHeader,
    OptionCardTitleArea,
    OptionCardTitle,
    OptionCardDescription,
    OptionCardContent,
} from "@/components/OptionCard";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSettings } from "@/context/SettingsContext";
import { useBangsContext } from "@/context/BangsContext";
import { DownloadIcon, UploadIcon } from "lucide-react";
  
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
  
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      setFileName(file.name);
  
      try {
        const text = await file.text();
        const data = JSON.parse(text);
  
        if (!data.settings) {
          throw new Error("JSON doesn't contain 'settings' key.");
        }
  
        const {
          defaultEngine: importedDefaultEngine,
          useCallSymbol: importedUseCallSymbol,
          forceFirstBang: importedForceFirstBang,
          ddgPresets: importedDdgPresets,
          bangs,
        } = data.settings;
  
        if (importedDefaultEngine !== undefined) setdefaultEngine(importedDefaultEngine);
        if (importedUseCallSymbol !== undefined) setUseCallSymbol(importedUseCallSymbol);
        if (importedForceFirstBang !== undefined) setforceFirstBang(importedForceFirstBang);
        if (importedDdgPresets !== undefined) setddgPresets(importedDdgPresets);
  
        if (Array.isArray(bangs)) {
          await Promise.all(
            bangsTabs
              .filter((b) => b.id !== undefined)
              .map((b) => deleteBangs(b.id!))
          );
  
          // Add new bangs
          for (const bang of bangs) {
            const { d, s, t, u } = bang;
            if (d && s && t && u) {
              await addBangs({ d, s, t, u });
            }
          }
        }
  
        toast("Settings imported successfully");
      } catch (err) {
        console.error(err);
        toast("Failed to import settings. Check the JSON file.");
      } finally {
        e.target.value = "";
      }
    };
  
    const handleImportClick = () => {
      fileInputRef.current?.click();
    };
  
    const handleExport = () => {
      try {
        const data = {
          settings: {
            defaultEngine,
            useCallSymbol,
            forceFirstBang,
            ddgPresets,
            bangs: bangsTabs,
          },
        };
  
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cuzbang-settings.json";
        a.click();
  
        toast("Settings exported successfully as JSON");
      } catch (err) {
        console.error(err);
        toast("Failed to export settings.");
      }
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
                <Button variant="outline" size="sm" onClick={handleImportClick}>
                    <UploadIcon className="w-4 h-4" /> Import from JSON
                </Button>
                
                <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={handleFileChange}
                />

                <Button variant="outline" size="sm" onClick={handleExport}>
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