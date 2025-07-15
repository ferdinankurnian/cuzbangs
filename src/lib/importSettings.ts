import React from "react";
import { type Bangs } from "../db";

export interface ImportProps {
    e : React.ChangeEvent<HTMLInputElement>,
    setFileName : React.Dispatch<React.SetStateAction<string>>,
    addBangs : (bang : Bangs) => Promise<void>,
    deleteBangs : (id : number) => Promise<void>,
    setdefaultEngine : (engine: string) => void,
    setUseCallSymbol : (exclamation: string) => void,
    setforceFirstBang : (force: string) => void,
    setddgPresets : (presets: string) => void,
    toast : (message : string) => void,
    bangsTabs : Bangs[],
}
  
export const handleChange = async ({
    e,
    setFileName,
    addBangs,
    bangsTabs,
    deleteBangs,
    setdefaultEngine,
    setUseCallSymbol,
    setforceFirstBang,
    setddgPresets,
    toast,
} : ImportProps) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.settings) {
        throw new Error("JSON doesn't contain 'settings' key.");
    }

    const {
        defaultEngine: importedDefaultEngine,
        useCallSymbol: importedUseCallSymbol,
        forceFirstBang: importedForceFirstBang,
        ddgPresets: importedDdgPresets,
        bangs,
    } = data.settings;

    if (importedDefaultEngine !== undefined) setdefaultEngine(importedDefaultEngine);
    if (importedUseCallSymbol !== undefined) setUseCallSymbol(importedUseCallSymbol);
    if (importedForceFirstBang !== undefined) setforceFirstBang(importedForceFirstBang);
    if (importedDdgPresets !== undefined) setddgPresets(importedDdgPresets);

    if (Array.isArray(bangs)) {
        await Promise.all(
        bangsTabs
            .filter((b) => b.id !== undefined)
            .map((b) => deleteBangs(b.id!))
        );

        // Add new bangs
        for (const bang of bangs) {
            const { d, s, t, u, jc } = bang;
            if (d && s && t && u && jc !== undefined) {
                await addBangs({ d, s, t, u, jc });
            }
        }
    }

    toast("Settings imported successfully");
    } catch (err) {
    console.error(err);
    toast("Failed to import settings. Check the JSON file.");
    } finally {
    e.target.value = "";
    }
};

export const handleImport = ({ fileInputRef }: { fileInputRef: React.RefObject<HTMLInputElement | null> }) => {
    fileInputRef.current?.click();
};
