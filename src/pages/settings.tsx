import { Button } from "@/components/ui/button";
import { ChevronsUpDown, LucideArrowLeft, PlusCircle, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import Yeah from "../components/Yeah";
import DefaultSearchEngine from "./settings/DefaultSearchEngine";
import SymbolCall from "./settings/SymbolCall";
import FirstPositionCall from "./settings/FirstPositionCall";
import DdgBangsPresets from "./settings/DdgBangsPresets";
import CustomBangs from "./settings/CustomBangs";
import { useSettings } from "../context/SettingsContext";
import ImportExport from "./settings/ImportExport";
import { useEffect } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function Settings() {

  useEffect(() => {
    document.title = "Settings - cuzbangs";
  }, []);

  const {
    useCallSymbol,
    setUseCallSymbol,
    forceFirstBang,
    setforceFirstBang,
  } = useSettings();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
      <div className="h-screen w-full grid">
        <div className="grid grid-cols-3 items-center border-b p-2 top-0 left-0 right-0 bg-background/40 backdrop-blur-sm z-10">
          <Link to="/">
            <Button variant="outline">
              <LucideArrowLeft />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-center">Settings</h1>
          <Yeah />
        </div>
        <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
          <ImportExport />
          <DefaultSearchEngine />
          <SymbolCall
            useCallSymbol={useCallSymbol}
            setUseCallSymbol={setUseCallSymbol}
          />
          <FirstPositionCall
            useFirstPosition={forceFirstBang}
            setuseFirstPosition={setforceFirstBang}
            callExclamation={useCallSymbol}
          />
          <DdgBangsPresets />
          <CustomBangs />
          <h1 className="text-sm text-center opacity-75 mb-4">
            Copyright &copy; 2025 Ferdinan Iydheko
          </h1>
        </div>
      </div>
      <div className="h-screen w-full flex flex-col md:border-l">
        <div className="h-fit flex flex-row justify-between items-center border-b p-2 top-0 left-0 right-0 bg-background/40 backdrop-blur-sm z-10">
          <h1 className="text-xl font-bold text-center ms-2">Bangs</h1>
          <Button variant="outline" className="w-fit ml-auto"><PlusCircle /> Add bangs</Button>
        </div>
        <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
          <Collapsible>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="w-10 h-10 bg-neutral-900 rounded-md">

                </div>
                <CardTitle className="flex-1 text-lg">Google</CardTitle>
                <CardAction>
                <CollapsibleTrigger>
                  <Button variant="ghost" size="icon">
                  <ChevronsUpDown />
                  </Button>
                  </CollapsibleTrigger>
                </CardAction>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid w-full items-center gap-1.5 mt-2">
                    <Label htmlFor="customurl">Bangs name</Label>
                    <Input
                      type="text"
                      id="customurl"
                      placeholder="Bangs name"
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5 mt-2">
                    <Label htmlFor="customurl">Bangs call</Label>
                    <Input
                      type="text"
                      id="customurl"
                      placeholder="Bangs call"
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5 mt-2">
                    <Label htmlFor="customurl">Bangs URL</Label>
                    <Input
                      type="text"
                      id="customurl"
                      placeholder="Bangs URL"
                    />
                  </div>
                  <div className="flex flex-row justify-between items-center">
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="noquery"
                            
                          />
                          <Label className="pt-1" htmlFor="noquery">Set Just for Calling</Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set this bangs just for redirect.</p>
                        <p>It won't send any queries to this bangs.</p>
                      </TooltipContent>
                    </Tooltip>
                    <Button variant="destructive"><Trash /> Delete</Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
