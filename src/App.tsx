import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/lib/web3/appkit";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Freeze from "./pages/Freeze";
import Proposals from "./pages/Proposals";
import History from "./pages/History";
import Pay from "./pages/Pay";
import NotFound from "./pages/NotFound";

const App = () => (
  <Web3Provider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/freeze" element={<Freeze />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/history" element={<History />} />
          <Route path="/pay" element={<Pay />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </Web3Provider>
);

export default App;
