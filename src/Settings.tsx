import { Button } from "@/components/ui/button";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, LucideArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Settings() {
  const [defaultEngine, setdefaultEngine] = React.useState("google");

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="max-w-[10rem] min-w-sm md:min-w-md lg:min-w-2xl flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center border rounded-lg p-2">
          <Link to="/">
            <Button variant="outline">
              <LucideArrowLeft />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            Yeah!
          </Button>
        </div>
        <div className="flex flex-row gap-5 justify-between items-center border rounded-lg p-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-md font-semibold">Default Search Engine</h1>
            <p className="text-sm opacity-75">
              Choose your default search engine for searching without calling
              bangs
            </p>
            <div
              className={
                defaultEngine == "custom"
                  ? "grid w-full max-w-sm items-center gap-1.5 mt-3"
                  : "hidden"
              }
            >
              <Label htmlFor="email">Custom url</Label>
              <Input type="text" id="customurl" placeholder="Enter Url" />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {defaultEngine.charAt(0).toUpperCase() + defaultEngine.slice(1)}{" "}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Search Engine</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={defaultEngine}
                onValueChange={setdefaultEngine}
              >
                <DropdownMenuRadioItem value="google">
                  Google
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="bing">Bing</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="duckduckgo">
                  DuckDuckGo
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="custom">
                  Custom..
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-row gap-5 justify-between items-center border rounded-lg p-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-md font-semibold">
              Use Exclamation Mark to call
            </h1>
            <p className="text-sm opacity-75">
              Use exclamation mark "!" to call bangs like !g for google
            </p>
          </div>
          <Switch id="airplane-mode" />
        </div>
        <div className="flex flex-row gap-5 justify-between items-center border rounded-lg p-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-md font-semibold">
              Force bangs call on first place
            </h1>
            <p className="text-sm opacity-75">
              Force bangs calling to be on first place like "!g what is cat?"
            </p>
          </div>
          <Switch id="airplane-mode" />
        </div>
        <div className="flex flex-row gap-5 justify-between items-center border rounded-lg p-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-md font-semibold">
              Use DuckDuckGo bangs presets
            </h1>
            <p className="text-sm opacity-75">
              Use DuckDuckGo bangs preset lists to bangs
            </p>
          </div>
          <Switch id="airplane-mode" />
        </div>
        <div className="flex flex-col gap-2 border rounded-lg p-4">
          <div className="flex flex-row gap-5 justify-between items-center">
            <div className="flex flex-col gap-1">
              <h1 className="text-md font-semibold">Custom bangs presets</h1>
              <p className="text-sm opacity-75">
                Add your own custom bangs presets to extend more webpages. These
                custom bangs will take priority over DuckDuckGo bangs when bangs
                call are same
              </p>
            </div>
            <Switch id="airplane-mode" />
          </div>
          <div className="flex flex-row gap-1">
            <div className="w-[15rem] border rounded-md p-3">
              <div className="flex flex-row items-center gap-2 bg-neutral-800 p-2 px-3 rounded">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 258 199"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M165.735 25.0701L188.947 0.972412H0.465994V25.0701H165.735Z"
                    fill="#e2e8f0"
                  />
                  <path
                    d="M163.981 96.3239L254.022 3.68314L221.206 3.68295L145.617 80.7609L163.981 96.3239Z"
                    fill="#e2e8f0"
                  />
                  <path
                    d="M233.658 131.418C233.658 155.075 214.48 174.254 190.823 174.254C171.715 174.254 155.513 161.738 150 144.439L146.625 133.848L127.329 153.143L129.092 157.336C139.215 181.421 163.034 198.354 190.823 198.354C227.791 198.354 257.759 168.386 257.759 131.418C257.759 106.937 244.399 85.7396 224.956 74.0905L220.395 71.3582L202.727 89.2528L210.788 93.5083C224.403 100.696 233.658 114.981 233.658 131.418Z"
                    fill="#e2e8f0"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M88.2625 192.669L88.2626 45.6459H64.1648L64.1648 192.669H88.2625Z"
                    fill="#e2e8f0"
                  />
                </svg>
                <h1>T3 Chat</h1>
              </div>
            </div>
            <div className="flex flex-col gap-4 border grow rounded-md p-3">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Bangs name</Label>
                <Input type="text" id="bangsname" placeholder="Bangs" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">URL</Label>
                <Input type="text" id="url" placeholder="URL" />
              </div>
              <Button className="w-fit">Save</Button>
            </div>
          </div>
        </div>
        <h1 className="text-sm text-center opacity-75">
          Copyright &copy; 2025 Ferdinan Iydheko
        </h1>
      </div>
    </div>
  );
}
