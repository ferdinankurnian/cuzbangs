import {
  OptionCard,
  OptionCardHeader,
  OptionCardTitleArea,
  OptionCardTitle,
  OptionCardDescription,
  OptionCardContent,
} from "@/components/OptionCard";
import { Button } from "@/components/ui/button";

interface DefaultSearchEngineProps {
  useCallSymbol: string;
  setUseCallSymbol: (value: string) => void;
}

export default function SymbolCall({
  useCallSymbol,
  setUseCallSymbol,
}: DefaultSearchEngineProps) {

  return (
    <OptionCard>
      <OptionCardHeader>
        <OptionCardTitleArea>
          <OptionCardTitle>Custom Symbol to call</OptionCardTitle>
          <OptionCardDescription>
            <p className="text-sm opacity-75">
              You can custom the symbol to call bangs like !yt or @yt for
              youtube
            </p>
          </OptionCardDescription>
        </OptionCardTitleArea>
      </OptionCardHeader>
      <OptionCardContent>
        <div className="flex gap-2">
          {["!", "@", "#", "$", "."].map((symbol) => (
            <Button
              key={symbol}
              variant={useCallSymbol === symbol ? "default" : "outline"}
              size="icon"
              aria-pressed={useCallSymbol === symbol}
              onClick={() => setUseCallSymbol(symbol)}
            >
              {symbol}
            </Button>
          ))}
        </div>
      </OptionCardContent>
    </OptionCard>
  );
}
