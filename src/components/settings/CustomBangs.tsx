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
import { Plus, Trash } from "lucide-react";
import { useState } from "react";

interface BangsTab {
  id: string;
  name: string;
  call: string;
  url: string;
}

// Helper function buat dapetin URL favicon
const getFaviconUrl = (url: string): string => {
  if (!url) return ""; // Kalo URL kosong, balikin string kosong
  try {
    const parsedUrl = new URL(url);
    // Kita pake Google Favicon API karena ini paling reliable dan gratis.
    // Ukuran favicon bisa diatur pake &size=XX, tapi default-nya udah cukup
    return `https://www.google.com/s2/favicons?sz=32&domain_url=${parsedUrl.hostname}`;
  } catch (error) {
    console.error("Error parsing URL for favicon:", error);
    return ""; // Kalo URL-nya ga valid, balikin string kosong
  }
};

export default function CustomBangs() {
  const [bangsTabs, setBangsTabs] = useState<BangsTab[]>([
    { id: "tab1", name: "Google", call: "g", url: "https://google.com" },
    { id: "tab2", name: "YouTube", call: "yt", url: "https://youtube.com" },
    {
      id: "tab3",
      name: "Stack Overflow",
      call: "so",
      url: "https://stackoverflow.com",
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>(
    bangsTabs[0]?.id || "",
  );

  const activeTab = bangsTabs.find((tab) => tab.id === activeTabId);

  const handleAddBangs = () => {
    const newId = `tab${bangsTabs.length + 1}`;
    const newBangs: BangsTab = { id: newId, name: "", call: "", url: "" };
    setBangsTabs([...bangsTabs, newBangs]);
    setActiveTabId(newId);
  };

  const handleDeleteBangs = () => {
    const updatedTabs = bangsTabs.filter((tab) => tab.id !== activeTabId);
    setBangsTabs(updatedTabs);
    setActiveTabId(updatedTabs[0]?.id || ""); // Set to first tab if exists, else empty
    console.log("Deleting Bangs:", activeTabId);
  };

  return (
    <OptionCard>
      <OptionCardHeader>
        <OptionCardTitleArea>
          <OptionCardTitle>Custom bangs</OptionCardTitle>
          <OptionCardDescription>
            Add your own custom bangs to extend more webpages. These custom
            bangs will take priority over DuckDuckGo bangs when bangs call are
            same. Remember not adding exclamation mark "!" to bangs call,
            because it can be enabled or disabled.
          </OptionCardDescription>
        </OptionCardTitleArea>
      </OptionCardHeader>
      <OptionCardContent className="flex flex-row gap-3">
        <div className="w-[15rem] max-h-[20rem] overflow-auto border rounded-md p-3 flex flex-col gap-2">
          {bangsTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTabId === tab.id ? "default" : "secondary"}
              className="justify-start flex items-center gap-2" // Tambahin flex items-center gap-2
              onClick={() => setActiveTabId(tab.id)}
            >
              {/* Favicon Image */}
              {tab.url && ( // Render hanya jika ada URL
                <img
                  src={getFaviconUrl(tab.url)}
                  alt={`${tab.name} favicon`}
                  className="w-4 h-4 rounded-full" // Atur ukuran dan bentuk
                  onError={(e) => {
                    // Kalo favicon gagal load (misal, URL ga valid atau server ga response),
                    // bisa ganti ke icon default atau sembunyiin
                    e.currentTarget.style.display = "none"; // Sembunyiin gambar yang error
                  }}
                />
              )}
              <span className="truncate">{tab.name || "Untitled Bang"}</span>{" "}
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
                  value={activeTab.name}
                  onChange={(e) => {
                    setBangsTabs(
                      bangsTabs.map((tab) =>
                        tab.id === activeTabId
                          ? { ...tab, name: e.target.value }
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
                  value={activeTab.call}
                  onChange={(e) => {
                    setBangsTabs(
                      bangsTabs.map((tab) =>
                        tab.id === activeTabId
                          ? { ...tab, call: e.target.value }
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
                  value={activeTab.url}
                  onChange={(e) => {
                    setBangsTabs(
                      bangsTabs.map((tab) =>
                        tab.id === activeTabId
                          ? { ...tab, url: e.target.value }
                          : tab,
                      ),
                    );
                  }}
                />
              </div>
              <div className="flex flex-row justify-between">
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
              Click Add Bangs to create your own bangs
            </p>
          )}
        </div>
      </OptionCardContent>
    </OptionCard>
  );
}
