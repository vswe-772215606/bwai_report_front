import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { UploadsListPage } from "./pages/UploadsListPage";
import { DocumentCatalogPage } from "./pages/DocumentCatalogPage";
import { BlueprintsPage } from "./pages/BlueprintsPage";
import { BlueprintDetailPage } from "./pages/BlueprintDetailPage";
import { DocumentAiJobsPage } from "./pages/DocumentAiJobsPage";
import { ControlledBatchesPage } from "./pages/ControlledBatchesPage";
import { JobHistoryPage } from "./pages/JobHistoryPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/uploads" element={<UploadsListPage />} />
            <Route path="/document-types" element={<DocumentCatalogPage />} />
            <Route path="/blueprints" element={<BlueprintsPage />} />
            <Route path="/blueprints/:id" element={<BlueprintDetailPage />} />
            <Route path="/document-ai-jobs" element={<DocumentAiJobsPage />} />
            <Route path="/controlled-batches" element={<ControlledBatchesPage />} />
            <Route path="/history" element={<JobHistoryPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
