import {
  OptionCard,
  OptionCardHeader,
  OptionCardTitleArea,
  OptionCardTitle,
  OptionCardDescription,
  OptionCardAction,
} from "@/components/OptionCard";
import { Switch } from "@/components/ui/switch";
import { Button } from "../ui/button";
import { Loader2Icon } from "lucide-react";

interface DdgBangsPresetsProps {
  useddgPresets: string;
  setuseddgPresets: (value: string) => void;
}

export default function DdgBangsPresets({
  useddgPresets,
  setuseddgPresets,
}: DdgBangsPresetsProps) {
  return (
    <OptionCard>
      <OptionCardHeader>
        <OptionCardTitleArea>
          <OptionCardTitle>Use DuckDuckGo bangs presets</OptionCardTitle>
          <OptionCardDescription>
            <p className="text-sm opacity-75">
              Use DuckDuckGo bangs preset lists to bangs
            </p>
          </OptionCardDescription>
        </OptionCardTitleArea>
        <OptionCardAction>
          <Switch
            checked={useddgPresets === "true"}
            onCheckedChange={(checked: boolean) => {
              setuseddgPresets(checked ? "true" : "false");
            }}
          />
        </OptionCardAction>
      </OptionCardHeader>
      <OptionCardDescription
        className={useddgPresets === "true" ? "" : "hidden"}
      >
        <div className="flex flex-row items-center gap-3">
          <Button size="sm" variant={"secondary"}>
            Sync
          </Button>
          <Button size="sm" variant={"secondary"} disabled>
            <Loader2Icon className="animate-spin" />
            Syncing
          </Button>
          <p className="text-sm opacity-75">Synced on 31 May 2025 15:42</p>
        </div>
      </OptionCardDescription>
    </OptionCard>
  );
}
