import { useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertTriangle, Download, RefreshCcw, Upload } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { syncBangs } from "@/lib/bangs-sync";
import { type AppConfig, db, SETTING_KEYS } from "@/lib/db";
import { updateConfig } from "@/lib/engine";
import { cn } from "@/lib/utils";

const SYMBOLS = ["!", "@", "#", "$", "."] as const;

const DEFAULT_CONFIG: AppConfig = {
  selectedEngine: "google",
  customUrl: "https://www.bing.com/search?go=Search&q=%s&qs=c",
  selectedSymbol: "!",
  forceBangsFirst: false,
  useStoreBangs: true,
  useKagiPrivacy: false,
  customSuggestionUrl: "",
};

export function ConfigsPanel() {
  const { resetData } = useApp();
  const navigate = useNavigate();
  const settings = useLiveQuery(() => db.settings.toArray());

  const config: AppConfig | null = settings
    ? {
        selectedEngine:
          (settings.find((s) => s.key === SETTING_KEYS.ENGINE)
            ?.value as string) || DEFAULT_CONFIG.selectedEngine,
        customUrl:
          (settings.find((s) => s.key === SETTING_KEYS.CUSTOM_URL)
            ?.value as string) || DEFAULT_CONFIG.customUrl,
        selectedSymbol:
          (settings.find((s) => s.key === SETTING_KEYS.SYMBOL)
            ?.value as string) || DEFAULT_CONFIG.selectedSymbol,
        forceBangsFirst:
          settings.find((s) => s.key === SETTING_KEYS.FORCE_FIRST)?.value ===
            "true" ||
          settings.find((s) => s.key === SETTING_KEYS.FORCE_FIRST)?.value ===
            true,
        useStoreBangs:
          settings.find((s) => s.key === SETTING_KEYS.USE_STORE)?.value ===
            "true" ||
          settings.find((s) => s.key === SETTING_KEYS.USE_STORE)?.value ===
            true,
        useKagiPrivacy:
          settings.find((s) => s.key === SETTING_KEYS.KAGI_PRIVACY)?.value ===
            "true" ||
          settings.find((s) => s.key === SETTING_KEYS.KAGI_PRIVACY)?.value ===
            true,
        customSuggestionUrl:
          (settings.find((s) => s.key === SETTING_KEYS.CUSTOM_SUGGESTION_URL)
            ?.value as string) || DEFAULT_CONFIG.customSuggestionUrl,
      }
    : null;

  const customUrlId = useId();
  const [isGrabbingBangs, setIsGrabbingBangs] = useState(false);
  const [grabStatus, setGrabStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const CONFIRMATION_STRING = "i understand, i want to delete my data now";

  useEffect(() => {
    const initConfig = async () => {
      const count = await db.settings.count();
      if (count === 0) {
        await updateConfig(DEFAULT_CONFIG);
        // Set default cookies
        document.cookie = `selected_engine=${DEFAULT_CONFIG.selectedEngine};path=/;max-age=31536000;SameSite=Lax`;
      }
    };
    initConfig();
  }, []);

  const handleUpdateConfig = async (updates: Partial<AppConfig>) => {
    await updateConfig(updates);
  };

  const handleExport = async () => {
    const userBangs = await db.userBangs.toArray();
    const configData = config;

    const exportFile = {
      version: 1,
      userBangs,
      config: configData,
    };

    const blob = new Blob([JSON.stringify(exportFile, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cuzbangs-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (data.userBangs) {
          await db.userBangs.bulkPut(data.userBangs);
        }
        if (data.config) {
          await updateConfig(data.config);
        }
        alert("Settings imported successfully!");
      } catch (err) {
        console.error("Import error:", err);
        alert("Failed to import settings. Check console for details.");
      }
    };
    input.click();
  };

  const handleGrabBangs = async () => {
    setIsGrabbingBangs(true);
    setGrabStatus("idle");

    try {
      const didSync = await syncBangs({ force: true });
      setGrabStatus(didSync ? "success" : "error");
    } catch (err) {
      console.error("Grab bangs error:", err);
      setGrabStatus("error");
    } finally {
      setIsGrabbingBangs(false);
    }
  };

  if (!config) return null;

  return (
    <section className="w-full space-y-6 pb-24">
      {/* Import / Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Import / Export Settings</CardTitle>
          <CardDescription>
            Import or export your settings with a cuzbangs JSON file.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="size-4" />
            Import from JSON
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="size-4" />
            Download as JSON
          </Button>
        </CardContent>
      </Card>

      {/* Default Search Engine */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Default Search Engine</CardTitle>
            <CardDescription>
              Choose your default search engine for searching without calling
              bangs
            </CardDescription>
          </div>
          <Select
            value={config.selectedEngine}
            onValueChange={(val) => handleUpdateConfig({ selectedEngine: val })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select engine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="bing">Bing</SelectItem>
              <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
              <SelectItem value="kagi">Kagi</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        {(config.selectedEngine === "custom" ||
          config.selectedEngine === "kagi") && (
          <CardContent className="space-y-3">
            {config.selectedEngine === "custom" ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor={customUrlId}>Custom URL</Label>
                  <Input
                    id={customUrlId}
                    value={config.customUrl}
                    onChange={(e) =>
                      handleUpdateConfig({ customUrl: e.target.value })
                    }
                    placeholder="https://example.com/search?q=%s"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custom Suggestion URL (Optional)</Label>
                  <Input
                    value={config.customSuggestionUrl}
                    onChange={(e) =>
                      handleUpdateConfig({
                        customSuggestionUrl: e.target.value,
                      })
                    }
                    placeholder="https://example.com/suggestions?q=%s"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      Use Privacy Pass suggestion URL
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Use kagisuggest.com for anonymous suggestions
                    </p>
                  </div>
                  <Switch
                    size="lg"
                    checked={config.useKagiPrivacy}
                    onCheckedChange={(val) =>
                      handleUpdateConfig({ useKagiPrivacy: val })
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Custom Symbol to call */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Symbol to call</CardTitle>
          <CardDescription>
            You can custom the symbol to call bangs like{" "}
            {`${config.selectedSymbol}yt`} for youtube
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {SYMBOLS.map((symbol) => (
              <Button
                key={symbol}
                variant={
                  config.selectedSymbol === symbol ? "default" : "outline"
                }
                size="icon"
                onClick={() => handleUpdateConfig({ selectedSymbol: symbol })}
                className="size-10 active:scale-95"
              >
                {symbol}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Force bangs call on first place */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Force bangs call on first place</CardTitle>
            <CardDescription>{`Force bangs calling to be on first place like "${config.selectedSymbol}g what is cat?".`}</CardDescription>
          </div>
          <Switch
            size="lg"
            checked={config.forceBangsFirst}
            onCheckedChange={(val) =>
              handleUpdateConfig({ forceBangsFirst: val })
            }
          />
        </CardHeader>
      </Card>

      {/* Store & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Store & Privacy</CardTitle>
          <CardDescription>
            Manage store bangs and local bang data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <p className="text-sm font-medium">Grab latest bangs</p>
                <p className="text-xs text-muted-foreground">
                  Refresh local store data from Kagi and cuzbangs.json.
                </p>
                {grabStatus !== "idle" && (
                  <p
                    className={cn(
                      "text-xs",
                      grabStatus === "success"
                        ? "text-green-500"
                        : "text-destructive",
                    )}
                  >
                    {grabStatus === "success"
                      ? "Bangs refreshed."
                      : "Failed to refresh bangs."}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGrabBangs}
                disabled={isGrabbingBangs}
              >
                <RefreshCcw
                  className={cn("size-4", isGrabbingBangs && "animate-spin")}
                />
                {isGrabbingBangs ? "Grabbing..." : "Grab Bangs"}
              </Button>
            </div>
            {/*<div className="flex items-center justify-between">
							<div className="space-y-1 text-left">
								<p className="text-sm font-medium">Use store bangs</p>
								<p className="text-xs text-muted-foreground">
									Use store bangs preset lists to bangs.
								</p>
							</div>
							<Switch
								size="lg"
								checked={config.useStoreBangs}
								onCheckedChange={(val) =>
									handleUpdateConfig({ useStoreBangs: val })
								}
							/>
						</div>*/}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20 bg-destructive/[0.02]">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="size-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Actions here are permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-left">
                <p className="text-sm font-medium">Reset Data</p>
                <p className="text-xs text-muted-foreground">
                  Clearing data will take you back to the onboarding flow.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowResetDialog(true)}
              >
                Reset Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={showResetDialog}
        onOpenChange={(open) => {
          setShowResetDialog(open);
          if (!open) setConfirmText("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All Data</DialogTitle>
            <DialogDescription>
              This action is irreversible. All your custom bangs,
              configurations, and local cache will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-sm font-medium">
              Please type{" "}
              <span className="font-mono text-destructive">
                "{CONFIRMATION_STRING}"
              </span>{" "}
              to confirm.
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type the exact phrase above"
              className="border-destructive/50 focus-visible:ring-destructive"
            />
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== CONFIRMATION_STRING}
              onClick={async () => {
                await resetData();
                navigate({ to: "/" });
              }}
            >
              Reset Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
