import { createRoot } from "react-dom/client";
import { AuthProvider } from "./contexts/AuthContext";
import { SystemProvider } from "./contexts/SystemContext";
import App from "./App";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <SystemProvider>
      <App />
      <Toaster position="top-center" expand={true} richColors closeButton />
    </SystemProvider>
  </AuthProvider>
);
