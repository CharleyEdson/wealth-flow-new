import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Plan from "./pages/Plan";
import PlanV2 from "./pages/PlanV2";
import PlanTemplates from "./pages/PlanTemplates";
import PlanTemplateBuilder from "./pages/PlanTemplateBuilder";
import PlanComponents from "./pages/PlanComponents";
import ClientPlan from "./pages/ClientPlan";
import Old1 from "./pages/Old1";
import Old2 from "./pages/Old2";
import Old3 from "./pages/Old3";
import Old4 from "./pages/Old4";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/plan-v2" element={<PlanV2 />} />
          <Route path="/plan-templates" element={<PlanTemplates />} />
          <Route path="/plan-templates/:templateId" element={<PlanTemplateBuilder />} />
          <Route path="/plan-components" element={<PlanComponents />} />
          <Route path="/client-plans/:clientPlanId" element={<ClientPlan />} />
          <Route path="/old1" element={<Old1 />} />
          <Route path="/old2" element={<Old2 />} />
          <Route path="/old3" element={<Old3 />} />
          <Route path="/old4" element={<Old4 />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
