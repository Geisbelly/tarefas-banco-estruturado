import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Statistics from "@/pages/Statistics";
import TaskList from "@/pages/TaskList";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import PrivateRoute from "@/components/controle"; // <-- AQUI

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
            <Route path="/auth" element={<Auth />} />

            {/* ROTAS PROTEGIDAS */}
            <Route element={<PrivateRoute />}>
              <Route path="/u/dashboard" element={<Statistics />} />
              <Route path="/tasks" element={<TaskList />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
