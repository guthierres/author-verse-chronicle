import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NewQuote from "./pages/NewQuote";
import QuoteDetail from "./pages/QuoteDetail";
import AuthorProfile from "./pages/AuthorProfile";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import Authors from "./pages/Authors";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/new-quote" element={<NewQuote />} />
              <Route path="/quote/:id" element={<QuoteDetail />} />
              <Route path="/author/:id" element={<AuthorProfile />} />
              <Route path="/authors" element={<Authors />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin-panel-secret-2024" element={<AdminPanel />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
