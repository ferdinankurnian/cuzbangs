import * as React from "react";
import {
  OptionCard,
  OptionCardHeader,
  OptionCardTitleArea,
  OptionCardTitle,
  OptionCardDescription,
  OptionCardAction,
  OptionCardContent,
} from "@/components/OptionCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";

interface DefaultSearchEngineProps {
  searchEngine: string;
  setsearchEngine: (value: string) => void;
}

export default function DefaultSearchEngine({
  searchEngine,
  setsearchEngine,
}: DefaultSearchEngineProps) {
  const defaultEngines = [
    { label: "Google", value: "https://www.google.com/search?q=%s" },
    { label: "Bing", value: "https://www.bing.com/search?q=%s" },
    { label: "DuckDuckGo", value: "https://duckduckgo.com/?q=%s" },
  ];

  const [customUrl, setCustomUrl] = React.useState(
    !defaultEngines.some((se) => se.value === searchEngine) ? searchEngine : "",
  );

  const isCustom = !defaultEngines.some((se) => se.value === searchEngine);

  const selectedLabel = isCustom
    ? "Custom"
    : (defaultEngines.find((se) => se.value === searchEngine)?.label ??
      "Unknown");

  return (
    <OptionCard>
      <OptionCardHeader>
        <OptionCardTitleArea>
          <OptionCardTitle>Default Search Engine</OptionCardTitle>
          <OptionCardDescription>
            Choose your default search engine for searching without calling
            bangs
          </OptionCardDescription>
        </OptionCardTitleArea>
        <OptionCardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {selectedLabel}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Search Engine</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={isCustom ? "custom" : searchEngine}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setsearchEngine(customUrl || "");
                  } else {
                    setsearchEngine(value);
                  }
                }}
              >
                {defaultEngines.map((se) => (
                  <DropdownMenuRadioItem key={se.value} value={se.value}>
                    {se.label}
                  </DropdownMenuRadioItem>
                ))}
                <DropdownMenuRadioItem value="custom">
                  Custom
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </OptionCardAction>
      </OptionCardHeader>

      {isCustom && (
        <OptionCardContent className="grid w-full max-w-sm items-center gap-1.5 mt-2">
          <Label htmlFor="customurl">Custom URL</Label>
          <Input
            type="text"
            id="customurl"
            placeholder="Example: https://example.com/search?q=%s"
            value={customUrl}
            onChange={(e) => {
              const val = e.target.value;
              setCustomUrl(val);
              setsearchEngine(val);
            }}
          />
        </OptionCardContent>
      )}
    </OptionCard>
  );
}
