import {
  OptionCard,
  OptionCardHeader,
  OptionCardTitleArea,
  OptionCardTitle,
  OptionCardDescription,
  OptionCardAction,
} from "@/components/OptionCard";
import { Switch } from "@/components/ui/switch";

interface DefaultSearchEngineProps {
  useExclamation: string;
  setuseExclamation: (value: string) => void;
}

export default function ExclamationCall({
  useExclamation,
  setuseExclamation,
}: DefaultSearchEngineProps) {
  return (
    <OptionCard>
      <OptionCardHeader>
        <OptionCardTitleArea>
          <OptionCardTitle>Use Exclamation Mark to call</OptionCardTitle>
          <OptionCardDescription>
            Use exclamation mark "!" to call bangs like !g for google
          </OptionCardDescription>
        </OptionCardTitleArea>
        <OptionCardAction>
          <Switch
            id="airplane-mode"
            checked={useExclamation === "true"}
            onCheckedChange={(checked: boolean) => {
              setuseExclamation(checked ? "true" : "false");
            }}
          />
        </OptionCardAction>
      </OptionCardHeader>
    </OptionCard>
  );
}
