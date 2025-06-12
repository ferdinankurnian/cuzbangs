import {
  OptionCard,
  OptionCardHeader,
  OptionCardTitleArea,
  OptionCardTitle,
  OptionCardDescription,
  OptionCardContent,
} from "@/components/OptionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { type Bangs } from "@/db";

interface CustomBangsProps {
  bangsTabs: Bangs[];
  setBangsTabs: React.Dispatch<React.SetStateAction<Bangs[]>>;
}

const getFaviconUrl = (url: string): string => {
  if (!url) return "";
  try {
    const parsedUrl = new URL(url);
    return `https://www.google.com/s2/favicons?sz=32&domain_url=${parsedUrl.hostname}`;
  } catch {
    return "";
  }
};

export default function CustomBangs({
  bangsTabs,
  setBangsTabs,
}: CustomBangsProps) {
  const [activeTabId, setActiveTabId] = useState<string>(
    String(bangsTabs[0]?.id || ""),
  );

  const activeTab = bangsTabs.find((tab) => tab.id === Number(activeTabId));

  const handleAddBangs = () => {
    const newBangs: Bangs = {
      id: bangsTabs.length + 1,
      d: "",
      s: "",
      t: "",
      u: "",
    };
    setBangsTabs([...bangsTabs, newBangs]);
    setActiveTabId(String(newBangs.id));
  };

  const handleDeleteBangs = () => {
    const currentTabIndex = bangsTabs.findIndex(
      (tab) => tab.id === Number(activeTabId),
    );
    const updatedTabs = bangsTabs.filter(
      (tab) => tab.id !== Number(activeTabId),
    );
    setBangsTabs(updatedTabs);

    if (updatedTabs.length > 0) {
      let newActiveTabId: string;
      if (currentTabIndex >= 0 && currentTabIndex < updatedTabs.length) {
        newActiveTabId = String(updatedTabs[currentTabIndex].id);
      } else {
        newActiveTabId = String(updatedTabs[updatedTabs.length - 1].id);
      }
      setActiveTabId(newActiveTabId);
    } else {
      setActiveTabId("");
    }

    console.log("Deleting Bangs:", activeTabId);
  };

  return (
    <OptionCard>
      <OptionCardHeader>
        <OptionCardTitleArea>
          <OptionCardTitle>Custom bangs</OptionCardTitle>
          <OptionCardDescription>
            <p className="text-sm opacity-75">
              Add your own custom bangs to extend more webpages. These custom
              bangs will take priority over DuckDuckGo bangs when bangs call are
              same. Remember not adding exclamation mark "!" to bangs call,
              because it can be enabled or disabled.
            </p>
          </OptionCardDescription>
        </OptionCardTitleArea>
      </OptionCardHeader>
      <OptionCardContent className="flex flex-row gap-3">
        <div className="w-[15rem] max-h-[20rem] overflow-auto border rounded-md p-3 flex flex-col gap-2">
          {bangsTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={Number(activeTabId) === tab.id ? "default" : "secondary"}
              className="justify-start flex items-center gap-2" // Tambahin flex items-center gap-2
              onClick={() => setActiveTabId(String(tab.id))}
            >
              {/* Favicon Image */}
              {tab.u ? (
                getFaviconUrl(tab.u) ? (
                  <img
                    src={getFaviconUrl(tab.u)}
                    alt={`${tab.s} favicon`}
                    className="w-4 h-4"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <Globe />
                )
              ) : (
                <Globe />
              )}
              <span className="truncate">{tab.s || "Untitled Bang"}</span>{" "}
              {/* Tambah truncate biar gak kepanjangan */}
            </Button>
          ))}
          <Button
            variant={"ghost"}
            size={"sm"}
            className="w-fit mx-auto"
            onClick={handleAddBangs}
          >
            <Plus /> Add Bangs
          </Button>
        </div>
        <div className="flex flex-col gap-4 border grow rounded-md p-3 pt-4">
          {activeTab ? (
            <>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="bangsname">Bangs name</Label>
                <Input
                  type="text"
                  id="bangsname"
                  placeholder="Bangs name"
                  value={activeTab.s}
                  onChange={(e) => {
                    setBangsTabs(
                      bangsTabs.map((tab) =>
                        String(tab.id) === activeTabId
                          ? { ...tab, s: e.target.value }
                          : tab,
                      ),
                    );
                  }}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="bangscall">Bangs call</Label>
                <Input
                  type="text"
                  id="bangscall"
                  placeholder="Bangs call"
                  value={activeTab.t}
                  onChange={(e) => {
                    setBangsTabs(
                      bangsTabs.map((tab) =>
                        String(tab.id) === activeTabId
                          ? { ...tab, t: e.target.value }
                          : tab,
                      ),
                    );
                  }}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="url">URL</Label>
                <Input
                  type="text"
                  id="url"
                  placeholder="URL"
                  value={activeTab.u}
                  onChange={(e) => {
                    setBangsTabs(
                      bangsTabs.map((tab) =>
                        String(tab.id) === activeTabId
                          ? { ...tab, u: e.target.value }
                          : tab,
                      ),
                    );
                  }}
                />
              </div>
              <div className="flex flex-row justify-end">
                <Button
                  variant={"destructive"}
                  className="w-fit"
                  onClick={handleDeleteBangs}
                >
                  <Trash />
                  Delete
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">
              You didn't have bangs yet
            </p>
          )}
        </div>
      </OptionCardContent>
    </OptionCard>
  );
}
