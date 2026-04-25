import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadsListPage } from "./pages/UploadsListPage";
import { UploadExcelPage } from "./pages/UploadExcelPage";
import { UploadDetailPage } from "./pages/UploadDetailPage";
import { TableReviewPage } from "./pages/TableReviewPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { TemplateDetailPage } from "./pages/TemplateDetailPage";
import { MappingPage } from "./pages/MappingPage";
import { ValidationPage } from "./pages/ValidationPage";
import { GenerateReportPage } from "./pages/GenerateReportPage";
import { ReportsPage } from "./pages/ReportsPage";

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
            <Route path="/uploads/new" element={<UploadExcelPage />} />
            <Route path="/uploads/:id" element={<UploadDetailPage />} />
            <Route path="/table-review/:id" element={<TableReviewPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/templates/:id" element={<TemplateDetailPage />} />
            <Route path="/mapping" element={<MappingPage />} />
            <Route path="/validation" element={<ValidationPage />} />
            <Route path="/generate" element={<GenerateReportPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
