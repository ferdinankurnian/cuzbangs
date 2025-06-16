import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { db, type Bangs } from "../db";
import { Loader2 } from "lucide-react";

interface BangsContextType {
  bangsTabs: Bangs[];
  addBangs: (newBang: Omit<Bangs, "id">) => Promise<Bangs>;
  updateBangs: (updatedBang: Bangs) => Promise<void>;
  deleteBangs: (id: number) => Promise<void>;
  isLoadingBangs: boolean;
}

const BangsContext = createContext<BangsContextType | undefined>(undefined);

export const BangsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [bangsTabs, setBangsTabsState] = useState<Bangs[]>([]);
  const [isLoadingBangs, setIsLoadingBangs] = useState(true);

  useEffect(() => {
    const loadBangs = async () => {
      try {
        const storedBangs = await db.bangs.toArray();
        setBangsTabsState(storedBangs);
      } catch (error) {
        console.error("Failed to load bangs from Dexie:", error);
        setBangsTabsState([]);
      } finally {
        setIsLoadingBangs(false);
      }
    };

    loadBangs();
  }, []);

  const addBangs = useCallback(async (newBang: Omit<Bangs, "id">) => {
    try {
      const id = await db.bangs.add(newBang as Bangs);
      const addedBang = { ...newBang, id };
      setBangsTabsState((prevTabs) => [...prevTabs, addedBang]);
      return addedBang;
    } catch (error) {
      console.error("Failed to add bang:", error);
      throw error;
    }
  }, []);

  const updateBangs = useCallback(async (updatedBang: Bangs) => {
    try {
      if (updatedBang.id === undefined) {
        throw new Error("Cannot update bang: ID is missing.");
      }
      await db.bangs.put(updatedBang);
      setBangsTabsState((prevTabs) =>
        prevTabs.map((tab) => (tab.id === updatedBang.id ? updatedBang : tab)),
      );
    } catch (error) {
      console.error(`Failed to update bang with ID ${updatedBang.id}:`, error);
      throw error;
    }
  }, []);

  const deleteBangs = useCallback(async (id: number) => {
    try {
      await db.bangs.delete(id);
      setBangsTabsState((prevTabs) => prevTabs.filter((tab) => tab.id !== id));
    } catch (error) {
      console.error(`Failed to delete bang with ID ${id}:`, error);
      throw error;
    }
  }, []);

  const value: BangsContextType = {
    bangsTabs,
    addBangs,
    updateBangs,
    deleteBangs,
    isLoadingBangs,
  };

  if (isLoadingBangs) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-background z-50">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <BangsContext.Provider value={value}>{children}</BangsContext.Provider>
  );
};

export const useBangsContext = () => {
  const context = useContext(BangsContext);
  if (!context) {
    throw new Error("useBangsContext must be used within a BangsProvider");
  }
  return context;
};
