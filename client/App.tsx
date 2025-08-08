import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import UserList from "./pages/UserList";
import UserDetail from "./pages/UserDetail";
import ResponseActions from "./pages/ResponseActions";
import ResponseActionDetail from "./pages/ResponseActionDetail";
import ResponseActionCreate from "./pages/ResponseActionCreate";
import ResponseActionEdit from "./pages/ResponseActionEdit";
import AIMarketingLayout from "./components/AIMarketingLayout";
import StrategyGoals from "./pages/AIMarketing/StrategyGoals";
import LiveMonitoring from "./pages/AIMarketing/LiveMonitoring";
import PerformanceAnalytics from "./pages/AIMarketing/PerformanceAnalytics";
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
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/users" element={<Layout><UserList /></Layout>} />
          <Route path="/users/:cdpId" element={<Layout><UserDetail /></Layout>} />
          <Route path="/response-actions" element={<Layout><ResponseActions /></Layout>} />
          <Route path="/response-actions/create" element={<Layout><ResponseActionCreate /></Layout>} />
          <Route path="/response-actions/edit/:id" element={<Layout><ResponseActionEdit /></Layout>} />
          <Route path="/response-actions/:id" element={<Layout><ResponseActionDetail /></Layout>} />
          <Route path="/ai-marketing/strategy-goals" element={<Layout><AIMarketingLayout><StrategyGoals /></AIMarketingLayout></Layout>} />
          <Route path="/ai-marketing/live-monitoring" element={<Layout><AIMarketingLayout><LiveMonitoring /></AIMarketingLayout></Layout>} />
          <Route path="/ai-marketing/performance-analytics" element={<Layout><AIMarketingLayout><PerformanceAnalytics /></AIMarketingLayout></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
