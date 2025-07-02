import {
  OptionCard,
  OptionCardHeader,
  OptionCardTitleArea,
  OptionCardTitle,
  OptionCardDescription,
  OptionCardAction,
} from "@/components/OptionCard";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";

export default function DdgBangsPresets() {
  const { ddgPresets, setddgPresets } = useSettings();

  return (
    <OptionCard>
      <OptionCardHeader>
        <OptionCardTitleArea>
          <OptionCardTitle>Use DuckDuckGo bangs presets</OptionCardTitle>
          <OptionCardDescription>
            <p className="text-sm opacity-75">
              Use DuckDuckGo bangs preset lists to bangs. All Bangs from{" "}
              <Button
                variant="link"
                className="h-auto p-0 text-sm opacity-75 underline"
                onClick={() => window.open("https://duckduckgo.com/bangs", "_blank")}
              >
                 DuckDuckGo
              </Button>
            </p>
          </OptionCardDescription>
        </OptionCardTitleArea>
        <OptionCardAction>
          <Switch
            checked={ddgPresets === "true"}
            onCheckedChange={(checked: boolean) =>
              setddgPresets(checked ? "true" : "false")
            }
          />
        </OptionCardAction>
      </OptionCardHeader>
    </OptionCard>
  );
}
