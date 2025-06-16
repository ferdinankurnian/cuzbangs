import {
  OptionCard,
  OptionCardHeader,
  OptionCardTitleArea,
  OptionCardTitle,
  OptionCardDescription,
  OptionCardAction,
} from "@/components/OptionCard";
import { Switch } from "@/components/ui/switch";

interface FirstPositionCallProps {
  useFirstPosition: string;
  setuseFirstPosition: (value: string) => void;
  callExclamation: string;
}

export default function FirstPositionCall({
  useFirstPosition,
  setuseFirstPosition,
  callExclamation,
}: FirstPositionCallProps) {
  return (
    <OptionCard>
      <OptionCardHeader>
        <OptionCardTitleArea>
          <OptionCardTitle>Force bangs call on first place</OptionCardTitle>
          <OptionCardDescription>
            <p className="text-sm opacity-75">
              Force bangs calling to be on first place like "!g what is cat?".
              Automatically forced when exclamation mark turned off
            </p>
          </OptionCardDescription>
        </OptionCardTitleArea>
        <OptionCardAction>
          <Switch
            checked={useFirstPosition === "true"}
            onCheckedChange={(checked: boolean) => {
              setuseFirstPosition(checked ? "true" : "false");
            }}
            disabled={callExclamation === "false"}
          />
        </OptionCardAction>
      </OptionCardHeader>
    </OptionCard>
  );
}
