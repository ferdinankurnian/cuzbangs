export interface ExportProps {
    defaultEngine: string;
    useCallSymbol: string;
    forceFirstBang: string;
    ddgPresets: any;
    bangsTabs: any[];
    toast: any;
}

export const handleExport = ({
    defaultEngine,
    useCallSymbol,
    forceFirstBang,
    ddgPresets,
    bangsTabs,
    toast,
}: ExportProps) => {
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
