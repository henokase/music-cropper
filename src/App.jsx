import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { EditorPage } from "./pages/EditorPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Layout } from "./components/layout/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster, toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

function App() {
  useRegisterSW({
    onOfflineReady() {
      toast.success("Ready for Offline Use!", {
        id: "pwa-offline-ready",
        description: "WaveCrop has been saved to your browser cache. You can now use all studio tools without an internet connection.",
        duration: 6000,
      });
    },
  });

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/not-found" element={<NotFoundPage />} />
            <Route
              path="*"
              element={<Navigate to="/not-found" replace />}
            />
          </Routes>
        </Layout>
        <Toaster
          position="bottom-right"
          gap={10}
          closeButton
          toastOptions={{
            duration: 3500,
          }}
        />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
