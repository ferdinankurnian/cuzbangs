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
import { useEffect, useState } from "react";

interface DefaultSearchEngineProps {
  searchEngine: string;
  setsearchEngine: (value: string) => void;
}

export default function DefaultSearchEngine({
  searchEngine,
  setsearchEngine,
}: DefaultSearchEngineProps) {
  const [customUrlError, setCustomUrlError] = useState("");
  const defaultEngines = [
    { label: "Google", value: "https://www.google.com/search?q=%s" },
    { label: "Bing", value: "https://www.bing.com/search?q=%s" },
    { label: "DuckDuckGo", value: "https://duckduckgo.com/?q=%s" },
  ];

  const [customUrl, setCustomUrl] = useState(
    !defaultEngines.some((se) => se.value === searchEngine) ? searchEngine : "",
  );

  useEffect(() => {
    const isNowCustom = !defaultEngines.some(
      (se) => se.value === searchEngine,
    );
    if (isNowCustom) {
      setCustomUrl(searchEngine);
    }
  }, [searchEngine, defaultEngines]);

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
            <p className="text-sm opacity-75">
              Choose your default search engine for searching without calling
              bangs
            </p>
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
              let error = '';
              if (!val.trim()) {
                error = 'URL cannot be empty';
              } else {
                try {
                  const url = new URL(val);
                  if (!(url.protocol === 'https:' || url.protocol === 'http:')) {
                    error = 'URL must start with http:// or https://';
                  } else if (!url.hostname || url.hostname.indexOf('.') === -1) {
                    error = 'URL must have a valid domain';
                  } else if ((val.match(/%s/g) || []).length !== 1) {
                    error = 'URL must contain exactly one %s';
                  }
                } catch {
                  error = 'Invalid URL format';
                }
              }
              setCustomUrlError(error);
              if (!error) {
                setsearchEngine(val);
              }
            }}
          />
          {customUrlError && (
            <p className="text-xs text-red-500 mt-1">{customUrlError}</p>
          )}
        </OptionCardContent>
      )}
    </OptionCard>
  );
}
