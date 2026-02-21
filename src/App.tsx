import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AppLayout } from "@/components/layout/AppLayout";
import { apiMe } from "@/lib/api";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import VehiclesPage from "./pages/Vehicles";
import TripsPage from "./pages/Trips";
import MaintenancePage from "./pages/Maintenance";
import DriversPage from "./pages/Drivers";
import ExpensesPage from "./pages/Expenses";
import AnalyticsPage from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthHydrate() {
  const { token, loginWithToken, logout } = useAuthStore();
  useEffect(() => {
    if (!token && localStorage.getItem("fleetflow_token")) {
      apiMe()
        .then((me) => loginWithToken(me.email, me.role, localStorage.getItem("fleetflow_token")!))
        .catch(() => logout());
    }
  }, []);
  return null;
}

import { UserRole } from "@/types";

const rolePermissions: Record<UserRole, string[]> = {
  fleet_manager: ['/dashboard', '/vehicles', '/trips', '/maintenance', '/drivers', '/expenses', '/analytics'],
  dispatcher: ['/vehicles', '/trips', '/drivers'],
  safety_officer: ['/vehicles', '/maintenance', '/drivers'],
  financial_analyst: ['/expenses', '/analytics'],
};

function getDefaultRoute(role: UserRole | null): string {
  if (!role) return '/dashboard';
  return rolePermissions[role][0];
}

function ProtectedRoute({ children, path }: { children: React.ReactNode; path: string }) {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && !rolePermissions[role].includes(path)) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

function RoleRedirect() {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultRoute(role)} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthHydrate />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/dashboard" element={<ProtectedRoute path="/dashboard"><DashboardPage /></ProtectedRoute>} />
          <Route path="/vehicles" element={<ProtectedRoute path="/vehicles"><VehiclesPage /></ProtectedRoute>} />
          <Route path="/trips" element={<ProtectedRoute path="/trips"><TripsPage /></ProtectedRoute>} />
          <Route path="/maintenance" element={<ProtectedRoute path="/maintenance"><MaintenancePage /></ProtectedRoute>} />
          <Route path="/drivers" element={<ProtectedRoute path="/drivers"><DriversPage /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute path="/expenses"><ExpensesPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute path="/analytics"><AnalyticsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
