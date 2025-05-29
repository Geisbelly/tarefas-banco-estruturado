
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Statistics from "./pages/u/Dashboard";
import TaskList from "./pages/u/TaskList";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import PrivateRoute from "./components/controle";
import Dashboard from "./pages/u/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Aqui você protege tudo que tiver dentro da pasta /u */}
            <Route element={<PrivateRoute />}>
              <Route path="/u/dashboard" element={<Dashboard />} />
              <Route path="/u/tasks" element={<TaskList />} />
            </Route>

            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
