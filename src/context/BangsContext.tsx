import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { db, type Bangs } from "../db"; // Pastikan path ke db.ts benar

interface BangsContextType {
  bangsTabs: Bangs[];
  addBangs: (newBang: Omit<Bangs, "id">) => Promise<Bangs>; // Fungsi untuk menambah bang baru, kembalikan bang dengan ID dari DB
  updateBangs: (updatedBang: Bangs) => Promise<void>; // Fungsi untuk update bang
  deleteBangs: (id: number) => Promise<void>; // Fungsi untuk delete bang
  isLoadingBangs: boolean; // State loading
}

// Inisialisasi Context dengan nilai undefined
const BangsContext = createContext<BangsContextType | undefined>(undefined);

// Provider untuk membungkus komponen yang akan mengakses context
export const BangsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [bangsTabs, setBangsTabsState] = useState<Bangs[]>([]);
  const [isLoadingBangs, setIsLoadingBangs] = useState(true);

  // --- EFFECT UNTUK LOAD DATA BANGS DARI DEXIE SAAT KOMPONEN DIMUNTING ---
  useEffect(() => {
    const loadBangs = async () => {
      try {
        const storedBangs = await db.bangs.toArray();
        setBangsTabsState(storedBangs);
      } catch (error) {
        console.error("Failed to load bangs from Dexie:", error);
        // Jika gagal load, set ke array kosong atau tampilkan pesan error
        setBangsTabsState([]);
      } finally {
        setIsLoadingBangs(false);
      }
    };

    loadBangs();
  }, []); // Dependency array kosong, effect ini hanya berjalan sekali saat komponen di-mount

  // --- FUNGSI UNTUK MENAMBAH BANGS BARU ---
  // Menerima Bangs tanpa ID, Dexie akan generate ID otomatis
  const addBangs = useCallback(async (newBang: Omit<Bangs, "id">) => {
    try {
      const id = await db.bangs.add(newBang as Bangs); // Gunakan add() untuk item baru
      const addedBang = { ...newBang, id }; // Buat objek Bangs lengkap dengan ID
      setBangsTabsState((prevTabs) => [...prevTabs, addedBang]); // Update state lokal
      return addedBang; // Kembalikan objek Bangs yang sudah punya ID dari DB
    } catch (error) {
      console.error("Failed to add bang:", error);
      throw error; // Lempar error agar bisa ditangani di komponen pemanggil
    }
  }, []);

  // --- FUNGSI UNTUK MENGUPDATE BANGS YANG SUDAH ADA ---
  const updateBangs = useCallback(async (updatedBang: Bangs) => {
    try {
      if (updatedBang.id === undefined) {
        throw new Error("Cannot update bang: ID is missing.");
      }
      await db.bangs.put(updatedBang); // Gunakan put() untuk update
      setBangsTabsState((prevTabs) =>
        prevTabs.map((tab) => (tab.id === updatedBang.id ? updatedBang : tab)),
      ); // Update state lokal
    } catch (error) {
      console.error(`Failed to update bang with ID ${updatedBang.id}:`, error);
      throw error;
    }
  }, []);

  // --- FUNGSI UNTUK MENGHAPUS BANGS ---
  const deleteBangs = useCallback(async (id: number) => {
    try {
      await db.bangs.delete(id); // Hapus dari Dexie berdasarkan ID
      setBangsTabsState((prevTabs) => prevTabs.filter((tab) => tab.id !== id)); // Update state lokal
    } catch (error) {
      console.error(`Failed to delete bang with ID ${id}:`, error);
      throw error;
    }
  }, []);

  // Nilai Context yang akan disediakan untuk komponen anak
  const value: BangsContextType = {
    bangsTabs,
    addBangs,
    updateBangs,
    deleteBangs,
    isLoadingBangs,
  };

  // Selama loading, bisa return null atau loading spinner
  if (isLoadingBangs) {
    return null; // Atau <LoadingSpinner />
  }

  return (
    <BangsContext.Provider value={value}>{children}</BangsContext.Provider>
  );
};

// --- CUSTOM HOOK UNTUK MENGGUNAKAN CONTEXT ---
export const useBangsContext = () => {
  const context = useContext(BangsContext);
  if (!context) {
    throw new Error("useBangsContext must be used within a BangsProvider");
  }
  return context;
};
