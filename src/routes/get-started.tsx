import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Copy,
  Database,
  Download,
  Globe,
  Loader2,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { syncBangs } from "@/lib/bangs-sync";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/get-started")({
  component: GetStartedPage,
});

const browserUrls = [
  {
    label: "Search URL",
    value: "https://cuzbangs.iydheko.dev/go?q=%s",
    field: "search",
  },
  {
    label: "Suggestion URL",
    value: "https://cuzbangs.iydheko.dev/suggestions?q=%s",
    field: "suggest",
  },
];

const steps = ["Info", "Downloading", "Applying", "Done"] as const;
type SetupStep = (typeof steps)[number];

const infoFeatures = [
  {
    icon: Database,
    title: "Stored locally",
    desc: "Bangs data lives in your browser.",
  },
  {
    icon: Lock,
    title: "No personal data",
    desc: "We collect nothing. We don't need your data.",
  },
  {
    icon: Globe,
    title: "One-time sync",
    desc: "Internet needed to pull the latest bangs data.",
  },
];

function StepIndicator({ currentStep }: { currentStep: SetupStep }) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex || currentStep === "Done";
        const isActive = index === currentIndex && currentStep !== "Done";

        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "size-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all duration-300",
                  isCompleted
                    ? "border-white bg-white text-black"
                    : isActive
                      ? "border-white bg-transparent text-white"
                      : "border-white/20 bg-transparent text-white/30",
                )}
              >
                {isCompleted ? (
                  <Check className="size-3.5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-sm transition-colors duration-300",
                  isActive
                    ? "text-white"
                    : isCompleted
                      ? "text-white/50"
                      : "text-white/20",
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-10 mb-5 transition-all duration-300",
                  isCompleted ? "bg-white/60" : "bg-white/10",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function GetStartedPage() {
  const { isConsented, acceptConsent } = useApp();
  const [currentStep, setCurrentStep] = useState<SetupStep>(
    isConsented ? "Done" : "Info",
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleAgree = async () => {
    setCurrentStep("Downloading");
    await Promise.all([
      new Promise((resolve) => setTimeout(resolve, 500)),
      syncBangs({ force: true }),
    ]);
    setCurrentStep("Applying");
    await new Promise((resolve) => setTimeout(resolve, 500));
    acceptConsent();
    setCurrentStep("Done");
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isWorking = currentStep === "Downloading" || currentStep === "Applying";
  const isFinished = currentStep === "Done";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      {/* Dark dot-grid background matching home page */}
      <div className="fixed inset-0 bg-black bg-[radial-gradient(#1B1B1C_1px,transparent_1px)] [background-size:16px_16px] -z-10" />
      <div className="fixed inset-x-0 top-0 mx-auto h-80 max-w-3xl bg-white/5 blur-3xl -z-10" />

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mt-6 mb-8">
          <h1 className="text-4xl font-semibold text-white [letter-spacing:-0.04em] mb-2">
            {isFinished ? "You're all set!" : "Let's get you set up"}
          </h1>
        </div>

        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Step card */}
        {currentStep === "Info" && (
          <Card>
            <CardHeader>
              <CardTitle>Before we download</CardTitle>
              <CardDescription>
                cuzbangs need to sync bangs data into this browser once.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-3">
                {infoFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="flex gap-4 rounded-xl border p-4 transition-colors items-start"
                    >
                      <div className="size-8 rounded-lg bg-muted border flex items-center justify-center shrink-0">
                        <Icon className="size-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{feature.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button onClick={handleAgree} className="flex-1">
                I Agree
                <Download />
              </Button>
            </CardFooter>
          </Card>
        )}

        {isWorking && (
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === "Downloading"
                  ? "Downloading bang data"
                  : "Applying setup"}
              </CardTitle>
              <CardDescription>
                {currentStep === "Downloading"
                  ? "Fetching the latest store data for local redirects."
                  : "Saving consent and preparing cuzbangs for use."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4 py-10">
                <div className="size-16 rounded-full border bg-muted flex items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentStep === "Downloading"
                    ? "Downloading bangs..."
                    : "Applying settings..."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isFinished && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <CardTitle>Add to browser</CardTitle>
                  <CardDescription>
                    Set these as your browser's default search engine.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {browserUrls.map((url) => (
                  <div key={url.field} className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      {url.label}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={url.value}
                        className="flex-1 text-xs cursor-text"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(url.value, url.field)}
                      >
                        {copiedField === url.field ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button asChild className="flex-1">
                <Link to="/">
                  Start searching
                  <ArrowRight />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground mt-5">
          {isWorking
            ? "Keep this tab open until setup finishes."
            : isFinished
              ? "You can revisit these URLs from Settings → Setup."
              : "Nothing downloads until you agree."}
        </p>
      </div>
    </main>
  );
}
