import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { EditorPage } from "./pages/EditorPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Layout } from "./components/layout/Layout";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <BrowserRouter>
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
            <Toaster position="bottom-center" />
        </BrowserRouter>
    );
}

export default App;
