import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import { apiLogin } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck } from 'lucide-react';
import { toast } from 'sonner';

const DEMO_EMAILS: Record<UserRole, string> = {
  fleet_manager: 'admin@fleetflow.io',
  dispatcher: 'dispatcher@fleetflow.io',
  safety_officer: 'safety@fleetflow.io',
  financial_analyst: 'analyst@fleetflow.io',
};

export default function LoginPage() {
  const [email, setEmail] = useState('admin@fleetflow.io');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState<UserRole>('fleet_manager');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const loginWithToken = useAuthStore((s) => s.loginWithToken);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loginEmail = email.trim() || DEMO_EMAILS[role];
    try {
      const res = await apiLogin(loginEmail, password);
      loginWithToken(loginEmail, res.role, res.access_token);
      navigate("/dashboard");
    } catch {
      // Backend unreachable or invalid credentials → use demo mode so you can always get in
      login(loginEmail, role);
      navigate("/dashboard");
      toast.info("Using demo mode (backend not connected or invalid credentials)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary font-bold text-sidebar-primary-foreground">
            FF
          </div>
          <span className="text-xl font-bold text-sidebar-accent-foreground">FleetFlow</span>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight text-sidebar-accent-foreground">
            Manage your fleet<br />with precision.
          </h2>
          <p className="text-sidebar-foreground/70 max-w-md">
            Track vehicles, dispatch trips, manage drivers, and analyze costs — all from one unified command center.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: 'Vehicles Tracked', value: '2,400+' },
              { label: 'Trips Completed', value: '18K+' },
              { label: 'Cost Saved', value: '32%' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-sidebar-accent/50 p-4">
                <p className="text-2xl font-bold text-sidebar-primary">{stat.value}</p>
                <p className="text-xs text-sidebar-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-sidebar-foreground/40">© 2026 FleetFlow. Modular Fleet & Logistics.</p>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
              FF
            </div>
            <span className="text-xl font-bold">FleetFlow</span>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your fleet dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fleet_manager">Fleet Manager</SelectItem>
                  <SelectItem value="dispatcher">Dispatcher</SelectItem>
                  <SelectItem value="safety_officer">Safety Officer</SelectItem>
                  <SelectItem value="financial_analyst">Financial Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Demo mode — select any role to explore the dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
