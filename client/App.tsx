import "./lib/ultimateWarningSuppress"; // Ultimate warning suppression - MUST be first
import "./lib/reactDevOverride"; // React development override
import "./lib/finalWarningFix"; // Final definitive warning suppression
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
import UserList from "./pages/UserList";
import UserList2 from "./pages/UserList2";
import UserDetail from "./pages/UserDetail";
import UserDetailNew from "./pages/UserDetail_New";
import UserDetail2 from "./pages/UserDetail2";
import AIMarketingStrategies from "./pages/AIMarketingStrategies";
import AIMarketingStrategyCreate from "./pages/AIMarketingStrategyCreate";
import AIMarketingStrategyDetail from "./pages/AIMarketingStrategyDetail";
import ResponseActions from "./pages/ResponseActions";
import ResponseActionDetail from "./pages/ResponseActionDetail";
import ResponseActionCreate from "./pages/ResponseActionCreate";
import MonitoringCenter from "./pages/AIMarketing/MonitoringCenter";
import FullyAuto from "./pages/AIMarketing/FullyAuto";
import SemiAuto from "./pages/AIMarketing/SemiAuto";
import ScriptCreate from "./pages/AIMarketing/ScriptCreate";
import ScenariosList from "./pages/AIMarketing/ScenariosList";
import ScenarioConfig from "./pages/AIMarketing/ScenarioConfig";
import PerformanceAnalytics from "./pages/AIMarketing/PerformanceAnalytics";
import LiveMonitoring from "./pages/AIMarketing/LiveMonitoring";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile";
import EffectTracking from "./pages/EffectTracking";
import { usePageRequestManager } from "./hooks/useRequestManager";

const queryClient = new QueryClient();

// 请求管理包装组件
const AppWithRequestManager = () => {
  usePageRequestManager(); // 使用页面级请求管理

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Authentication routes - no layout */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* User Profile route */}
          <Route
            path="/profile"
            element={
              <Layout>
                <UserProfile />
              </Layout>
            }
          />

          <Route
            path="/effect-tracking"
            element={
              <Layout>
                <EffectTracking />
              </Layout>
            }
          />

          {/* Main routes now point to 2.0 versions */}
          <Route
            path="/dashboard"
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
                <UserList2 />
              </Layout>
            }
          />

          {/* Legacy routes for direct access to old versions */}
          <Route
            path="/dashboard1"
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
            path="/users1"
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

          {/* Main user detail route now points to 2.0 version */}
          <Route
            path="/users/:userId"
            element={
              <Layout>
                <UserDetail2 />
              </Layout>
            }
          />

          {/* Legacy routes for old versions */}
          <Route
            path="/users1/:userId"
            element={
              <Layout>
                <UserDetail />
              </Layout>
            }
          />

          <Route
            path="/users-new/:userId"
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

          {/* AI营销策略管理 */}
          <Route
            path="/ai-marketing-strategies"
            element={
              <Layout>
                <AIMarketingStrategies />
              </Layout>
            }
          />

          <Route
            path="/ai-marketing-strategies/create"
            element={
              <Layout>
                <AIMarketingStrategyCreate />
              </Layout>
            }
          />

          <Route
            path="/ai-marketing-strategies/:strategyId"
            element={
              <Layout>
                <AIMarketingStrategyDetail />
              </Layout>
            }
          />

          {/* 响应动作管理 */}
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
            path="/response-actions/:actionId"
            element={
              <Layout>
                <ResponseActionDetail />
              </Layout>
            }
          />

          {/* AI营销功能模块 */}
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
            path="/ai-marketing/script-create"
            element={
              <Layout>
                <ScriptCreate />
              </Layout>
            }
          />

          <Route
            path="/ai-marketing/scenarios"
            element={
              <Layout>
                <ScenariosList />
              </Layout>
            }
          />

          <Route
            path="/ai-marketing/scenarios/:scenarioId"
            element={
              <Layout>
                <ScenarioConfig />
              </Layout>
            }
          />

          <Route
            path="/ai-marketing/performance"
            element={
              <Layout>
                <PerformanceAnalytics />
              </Layout>
            }
          />

          <Route
            path="/ai-marketing/live-monitoring"
            element={
              <Layout>
                <LiveMonitoring />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AppWithRequestManager />
    </QueryClientProvider>
  </ErrorBoundary>
);

createRoot(document.getElementById("root")!).render(<App />);
