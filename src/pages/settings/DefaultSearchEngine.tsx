import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { defaultEngines } from "@/data/defaultengines";

export default function DefaultSearchEngine() {
  const { defaultEngine, setdefaultEngine } = useSettings();
  const [customUrl, setCustomUrl] = useState("");
  const [error, setError] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Check if current engine is custom (not in default list)
  const isCustomEngine = !defaultEngines.some(engine => engine.value === defaultEngine);

  // Sync with external defaultEngine changes
  useEffect(() => {
    const engineIsCustom = !defaultEngines.some(engine => engine.value === defaultEngine);
    
    if (engineIsCustom) {
      // External change to custom engine
      setIsCustomMode(true);
      setCustomUrl(defaultEngine);
      setError("");
    } else {
      // External change to predefined engine
      setIsCustomMode(false);
      setCustomUrl("");
      setError("");
    }
  }, [defaultEngine]);
  
  // Get display label for dropdown
  const getDisplayLabel = () => {
    if (isCustomMode || isCustomEngine) return "Custom";
    return defaultEngines.find(engine => engine.value === defaultEngine)?.label || "Unknown";
  };

  const validateUrl = (url: string) => {
    if (!url.trim()) return "URL cannot be empty";
    
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return "URL must start with http:// or https://";
      }
      if (!parsed.hostname?.includes('.')) {
        return "URL must have a valid domain";
      }
      if (!url.includes('%s')) {
        return "URL must contain %s placeholder";
      }
      if ((url.match(/%s/g) || []).length > 1) {
        return "URL should only contain one %s placeholder";
      }
      return "";
    } catch {
      return "Invalid URL format";
    }
  };

  const handleEngineChange = (value: string) => {
    if (value === "custom") {
      // Switch to custom mode
      setIsCustomMode(true);
      setCustomUrl(isCustomEngine ? defaultEngine : "");
      setError("");
    } else {
      // Set predefined engine
      setIsCustomMode(false);
      setdefaultEngine(value);
      setCustomUrl("");
      setError("");
    }
  };

  const handleCustomUrlChange = (url: string) => {
    setCustomUrl(url);
    const validationError = validateUrl(url);
    setError(validationError);
    
    // Only update the engine if URL is valid
    if (!validationError) {
      setdefaultEngine(url);
    }
  };

  const showCustomInput = isCustomMode || isCustomEngine;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Default Search Engine</CardTitle>
        <CardDescription>
          Choose your default search engine for searching without calling bangs
        </CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {getDisplayLabel()}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Search Engine</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={(isCustomMode || isCustomEngine) ? "custom" : defaultEngine}
                onValueChange={handleEngineChange}
              >
                {defaultEngines.map((engine) => (
                  <DropdownMenuRadioItem key={engine.value} value={engine.value}>
                    {engine.label}
                  </DropdownMenuRadioItem>
                ))}
                <DropdownMenuRadioItem value="custom">
                  Custom
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      {showCustomInput && (
        <CardContent>
          <div className="grid w-full items-center gap-1.5 mt-2">
            <Label htmlFor="customurl">Custom URL</Label>
            <Input
              type="text"
              id="customurl"
              placeholder="https://example.com/search?q=%s"
              value={customUrl}
              onChange={(e) => handleCustomUrlChange(e.target.value)}
            />
          </div>
        </CardContent>
      )}

      {error && (
        <CardFooter>
          <p className="text-xs text-red-500">{error}</p>
        </CardFooter>
      )}
    </Card>
  );
}