
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DonorDashboard from "./pages/DonorDashboard";
import ReceiverDashboard from "./pages/ReceiverDashboard";
import AddDonation from "./pages/AddDonation";
import AdminDashboard from "./pages/AdminDashboard";
import ReceiverMessage from "./pages/ReceiverMessage";
import DonorInbox from "./pages/DonorInbox";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  // Create a client
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/:type" element={<Auth />} />
            
            {/* Protected donor routes */}
            <Route element={<PrivateRoute userType="donor" />}>
              <Route path="/donor/dashboard" element={<DonorDashboard />} />
              <Route path="/add-donation" element={<AddDonation />} />
              <Route path="/donor/inbox" element={<DonorInbox />} />
              <Route path="/donor/profile" element={<ProfilePage />} />
            </Route>
            
            {/* Protected receiver routes */}
            <Route element={<PrivateRoute userType="receiver" />}>
              <Route path="/receiver/dashboard" element={<ReceiverDashboard />} />
              <Route path="/receiver/message" element={<ReceiverMessage />} />
              <Route path="/receiver/profile" element={<ProfilePage />} />
            </Route>
            
            {/* Protected admin routes */}
            <Route element={<PrivateRoute userType="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/profile" element={<ProfilePage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
