import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Truck,
  Route,
  Wrench,
  Users,
  BarChart3,
  Fuel,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';

const navItems = [
  { title: 'Command Center', path: '/dashboard', icon: LayoutDashboard, roles: ['fleet_manager'] as UserRole[] },
  { title: 'Vehicles', path: '/vehicles', icon: Truck, roles: ['fleet_manager', 'dispatcher', 'safety_officer'] as UserRole[] },
  { title: 'Trip Dispatcher', path: '/trips', icon: Route, roles: ['fleet_manager', 'dispatcher'] as UserRole[] },
  { title: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['fleet_manager', 'safety_officer'] as UserRole[] },
  { title: 'Drivers', path: '/drivers', icon: Users, roles: ['fleet_manager', 'dispatcher', 'safety_officer'] as UserRole[] },
  { title: 'Expenses', path: '/expenses', icon: Fuel, roles: ['fleet_manager', 'financial_analyst'] as UserRole[] },
  { title: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['fleet_manager', 'financial_analyst'] as UserRole[] },
];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { logout, role, email } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleLabels: Record<string, string> = {
    fleet_manager: 'Fleet Manager',
    dispatcher: 'Dispatcher',
    safety_officer: 'Safety Officer',
    financial_analyst: 'Financial Analyst',
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 lg:relative',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo area */}
        <div className={cn('flex h-16 items-center border-b border-sidebar-border px-4', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary font-bold text-sidebar-primary-foreground text-sm">
            FF
          </div>
          {!collapsed && (
            <div className="animate-slide-in">
              <h1 className="text-sm font-bold text-sidebar-accent-foreground">FleetFlow</h1>
              <p className="text-[10px] text-sidebar-foreground/60">Fleet Management</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:block"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.filter((item) => !role || item.roles.includes(role)).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className={cn('border-t border-sidebar-border p-3', collapsed && 'px-2')}>
          {!collapsed && (
            <div className="mb-2 rounded-lg bg-sidebar-accent/50 px-3 py-2">
              <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{email}</p>
              <p className="text-[10px] text-sidebar-foreground/60">{roleLabels[role || '']}</p>
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
              collapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
              {email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
