import { scan } from "react-scan";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import Settings from "./Settings";
import { AppProviders } from "./context/AppProvider";
import { Toaster } from "@/components/ui/sonner";

scan({
  enabled: import.meta.env.DEV
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster />
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  </StrictMode>,
);
