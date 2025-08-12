import "./global.css";
import "./lib/suppressWarnings";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
import UserList from "./pages/UserList";
import UserList2 from "./pages/UserList2";
import UserDetail from "./pages/UserDetail";
import UserDetailNew from "./pages/UserDetail_New";
import UserDetail2 from "./pages/UserDetail2";
import ResponseActions from "./pages/ResponseActions";
import ResponseActionDetail from "./pages/ResponseActionDetail";
import ResponseActionCreate from "./pages/ResponseActionCreate";
import MonitoringCenter from "./pages/AIMarketing/MonitoringCenter";
import FullyAuto from "./pages/AIMarketing/FullyAuto";
import SemiAuto from "./pages/AIMarketing/SemiAuto";
import ScriptCreate from "./pages/AIMarketing/ScriptCreate";
import OrderHistoryDemo from "./pages/OrderHistoryDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/dashboard2"
            element={
              <Layout>
                <Dashboard2 />
              </Layout>
            }
          />
          <Route
            path="/users"
            element={
              <Layout>
                <UserList />
              </Layout>
            }
          />
          <Route
            path="/users2"
            element={
              <Layout>
                <UserList2 />
              </Layout>
            }
          />
          <Route
            path="/users/:cdpId"
            element={
              <Layout>
                <UserDetailNew />
              </Layout>
            }
          />
          <Route
            path="/users2/:userId"
            element={
              <Layout>
                <UserDetail2 />
              </Layout>
            }
          />
          <Route
            path="/response-actions"
            element={
              <Layout>
                <ResponseActions />
              </Layout>
            }
          />
          <Route
            path="/response-actions/create"
            element={
              <Layout>
                <ResponseActionCreate />
              </Layout>
            }
          />
          <Route
            path="/response-actions/edit/:id"
            element={
              <Layout>
                <ResponseActionCreate />
              </Layout>
            }
          />
          <Route
            path="/response-actions/:id"
            element={
              <Layout>
                <ResponseActionDetail />
              </Layout>
            }
          />
          <Route
            path="/ai-marketing/monitoring-center"
            element={
              <Layout>
                <MonitoringCenter />
              </Layout>
            }
          />
          <Route
            path="/ai-marketing/fully-auto"
            element={
              <Layout>
                <FullyAuto />
              </Layout>
            }
          />
          <Route
            path="/ai-marketing/semi-auto"
            element={
              <Layout>
                <SemiAuto />
              </Layout>
            }
          />
          <Route
            path="/ai-marketing/semi-auto/create"
            element={
              <Layout>
                <ScriptCreate />
              </Layout>
            }
          />
          <Route
            path="/ai-marketing/semi-auto/edit/:id"
            element={
              <Layout>
                <ScriptCreate />
              </Layout>
            }
          />
          <Route
            path="/order-history-demo"
            element={
              <Layout>
                <OrderHistoryDemo />
              </Layout>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route
            path="*"
            element={
              <Layout>
                <NotFound />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
