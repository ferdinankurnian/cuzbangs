import { scan } from "react-scan";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import Settings from "./Settings";
import BangsHandler from "./Bangs";
import { AppProviders } from "./context/AppProvider";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/react"

scan({
  enabled: import.meta.env.DEV
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SpeedInsights />
    <Toaster />
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/go" element={<BangsHandler />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  </StrictMode>,
);
