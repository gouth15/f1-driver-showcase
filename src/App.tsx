
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Drivers from "./pages/Drivers";
import Standings from "./pages/Standings";
import LiveTiming from "./pages/LiveTiming";
import LiveTimingDemo from "./pages/LiveTimingDemo";
import NotFound from "./pages/NotFound";

const App = () => {
  // Create QueryClient inside the component function
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/live" element={<LiveTiming />} />
            <Route path="/demo" element={<LiveTimingDemo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
