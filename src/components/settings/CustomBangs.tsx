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
import { useState, useEffect, useRef } from "react"; // <--- Tambahin useRef
import { useBangsContext } from "@/context/BangsContext";
import { type Bangs } from "@/db";

const getFaviconUrl = (url: string): string => {
  if (!url) return "";
  try {
    const parsedUrl = new URL(url);
    return `https://www.google.com/s2/favicons?sz=32&domain_url=${parsedUrl.hostname}`;
  } catch {
    return "";
  }
};

export default function CustomBangs() {
  const { bangsTabs, addBangs, updateBangs, deleteBangs, isLoadingBangs } =
    useBangsContext();

  const [activeTabId, setActiveTabId] = useState<string>("");
  // --- INI STATE BARU UNTUK INPUT YANG SEDANG DIEDIT ---
  const [editingBang, setEditingBang] = useState<Bangs | null>(null);

  // Ref untuk timer debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect untuk menginisialisasi atau mengupdate activeTabId
  // dan mengisi editingBang saat activeTabId atau bangsTabs berubah
  useEffect(() => {
    if (isLoadingBangs) return;

    if (
      bangsTabs.length > 0 &&
      (!activeTabId || !bangsTabs.some((tab) => String(tab.id) === activeTabId))
    ) {
      const firstTab = bangsTabs[0];
      setActiveTabId(String(firstTab.id));
      setEditingBang(firstTab); // Inisialisasi editingBang
    } else if (bangsTabs.length === 0 && activeTabId) {
      setActiveTabId("");
      setEditingBang(null);
    } else {
      // Jika activeTabId sudah ada dan valid di bangsTabs, update editingBang
      const currentActiveTab = bangsTabs.find(
        (tab) => String(tab.id) === activeTabId,
      );
      if (
        currentActiveTab &&
        JSON.stringify(currentActiveTab) !== JSON.stringify(editingBang)
      ) {
        // Hanya update editingBang jika ada perubahan signifikan
        setEditingBang(currentActiveTab);
      }
    }
  }, [bangsTabs, activeTabId, isLoadingBangs, editingBang]);

  // --- EFFECT UNTUK DEBOUNCING UPDATE KE DEXIE ---
  useEffect(() => {
    // Jangan debounce kalau tidak ada tab yang sedang diedit atau masih loading
    if (!editingBang || isLoadingBangs) return;

    // Bersihkan timer sebelumnya jika ada keystroke baru
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set timer baru. Fungsi update akan dijalankan setelah 500ms tanpa ketikan
    debounceTimerRef.current = setTimeout(() => {
      console.log("Debounced: Updating bang in Dexie", editingBang);
      updateBangs(editingBang);
    }, 500); // <-- Debounce delay 500ms

    // Cleanup function: ini akan jalan saat komponen unmount atau dependencies berubah
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [editingBang, updateBangs, isLoadingBangs]); // Trigger effect saat editingBang berubah

  // --- HANDLER UNTUK MENGGANTI TAB AKTIF ---
  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    // Saat tab diganti, langsung set editingBang ke versi terbaru dari tab tersebut
    const selectedTab = bangsTabs.find((tab) => String(tab.id) === tabId);
    setEditingBang(selectedTab || null);
  };

  const handleAddBangs = async () => {
    const newBangTemplate = {
      d: "",
      s: "",
      t: "",
      u: "",
    };
    try {
      const addedBang = await addBangs(newBangTemplate);
      setActiveTabId(String(addedBang.id));
      setEditingBang(addedBang); // Set the newly added bang as editing
    } catch (error) {
      console.error("Error adding new bang:", error);
    }
  };

  const handleDeleteBangs = async () => {
    if (!activeTabId || !editingBang || !editingBang.id) return;

    const idToDelete = editingBang.id;
    try {
      await deleteBangs(idToDelete);
      // activeTabId dan editingBang akan diupdate oleh useEffect setelah bangsTabs berubah
    } catch (error) {
      console.error(`Error deleting bang with ID ${idToDelete}:`, error);
    }
  };

  // --- HANDLER UNTUK UPDATE FIELD DI LOCAL STATE ---
  const handleFieldChange = (field: keyof Bangs, value: string) => {
    if (editingBang) {
      setEditingBang((prev) => (prev ? { ...prev, [field]: value } : null));
    }
  };

  if (isLoadingBangs) {
    return <p className="text-center">Loading your custom bangs...</p>;
  }

  // Tampilkan pesan jika tidak ada bangs
  if (!activeTabId && bangsTabs.length === 0 && !isLoadingBangs) {
    return (
      <OptionCard>
        <OptionCardHeader>
          <OptionCardTitleArea>
            <OptionCardTitle>Custom bangs</OptionCardTitle>
            <OptionCardDescription>
              <p className="text-sm opacity-75">
                Add your own custom bangs to extend more webpages. These custom
                bangs will take priority over DuckDuckGo bangs when bangs call
                are same. Remember not adding exclamation mark "!" to bangs
                call, because it can be enabled or disabled.
              </p>
            </OptionCardDescription>
          </OptionCardTitleArea>
        </OptionCardHeader>
        <OptionCardContent className="flex flex-row gap-3">
          <div className="w-[15rem] max-h-[20rem] overflow-auto border rounded-md p-3 flex flex-col gap-2">
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
            <p className="text-center text-gray-500">
              You didn't have any custom bangs yet.
            </p>
          </div>
        </OptionCardContent>
      </OptionCard>
    );
  }

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
              variant={String(tab.id) === activeTabId ? "default" : "secondary"}
              className="justify-start flex items-center gap-2"
              onClick={() => handleTabChange(String(tab.id))} // <--- Pakai handleTabChange
            >
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
              <span className="truncate">{tab.s || "Untitled Bang"}</span>
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
          {editingBang ? ( // <--- Render berdasarkan editingBang
            <>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="bangsname">Bangs name</Label>
                <Input
                  type="text"
                  id="bangsname"
                  placeholder="Bangs name"
                  value={editingBang.s} // <--- Value dari editingBang
                  onChange={(e) => handleFieldChange("s", e.target.value)} // <--- Pakai handleFieldChange
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="bangscall">Bangs call</Label>
                <Input
                  type="text"
                  id="bangscall"
                  placeholder="Bangs call"
                  value={editingBang.t} // <--- Value dari editingBang
                  onChange={(e) => handleFieldChange("t", e.target.value)} // <--- Pakai handleFieldChange
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="url">URL</Label>
                <Input
                  type="text"
                  id="url"
                  placeholder="URL"
                  value={editingBang.u} // <--- Value dari editingBang
                  onChange={(e) => handleFieldChange("u", e.target.value)} // <--- Pakai handleFieldChange
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
            // Ini akan muncul jika `bangsTabs.length` > 0 tapi `activeTabId` kosong (misal setelah delete tab terakhir)
            <p className="text-center text-gray-500">
              No bang selected. Select one from the left or add a new one.
            </p>
          )}
        </div>
      </OptionCardContent>
    </OptionCard>
  );
}
