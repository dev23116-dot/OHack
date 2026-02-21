import { useFleetStore } from '@/stores/fleetStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPICard } from '@/components/KPICard';
import { StatusBadge } from '@/components/StatusBadge';
import { Truck, AlertTriangle, Gauge, Package, Users, Route } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VehicleType, VehicleStatus } from '@/types';

export default function DashboardPage() {
  const { vehicles, drivers, trips } = useFleetStore();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (typeFilter !== 'all' && v.type !== typeFilter) return false;
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (regionFilter !== 'all' && v.region !== regionFilter) return false;
      return true;
    });
  }, [vehicles, typeFilter, statusFilter, regionFilter]);

  const regions = [...new Set(vehicles.map((v) => v.region))];
  const activeFleet = vehicles.filter((v) => v.status === 'On Trip').length;
  const maintenanceAlerts = vehicles.filter((v) => v.status === 'In Shop').length;
  const utilizationRate = vehicles.length > 0 ? Math.round((activeFleet / vehicles.length) * 100) : 0;
  const pendingCargo = trips.filter((t) => t.status === 'Draft').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Command Center" description="Real-time overview of your fleet operations" />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Active Fleet" value={activeFleet} subtitle={`${vehicles.length} total vehicles`} icon={Truck} trend={{ value: 12, positive: true }} />
        <KPICard title="Maintenance Alerts" value={maintenanceAlerts} subtitle="Vehicles in shop" icon={AlertTriangle} />
        <KPICard title="Utilization Rate" value={`${utilizationRate}%`} subtitle="On Trip / Total" icon={Gauge} trend={{ value: 5, positive: true }} />
        <KPICard title="Pending Cargo" value={pendingCargo} subtitle="Trips in draft" icon={Package} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Vehicle Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Truck">Truck</SelectItem>
            <SelectItem value="Van">Van</SelectItem>
            <SelectItem value="Bike">Bike</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="On Trip">On Trip</SelectItem>
            <SelectItem value="In Shop">In Shop</SelectItem>
            <SelectItem value="Retired">Retired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fleet table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>License Plate</th>
                <th>Region</th>
                <th>Odometer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v) => (
                <tr key={v.id}>
                  <td className="font-medium">{v.name}</td>
                  <td>{v.type}</td>
                  <td className="font-mono text-xs">{v.licensePlate}</td>
                  <td>{v.region}</td>
                  <td>{v.odometer.toLocaleString()} km</td>
                  <td><StatusBadge status={v.status} /></td>
                </tr>
              ))}
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted-foreground py-8">
                    No vehicles match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KPICard title="Total Drivers" value={drivers.length} subtitle={`${drivers.filter(d => d.status === 'On Duty').length} on duty`} icon={Users} />
        <KPICard title="Active Trips" value={trips.filter(t => t.status === 'Dispatched').length} subtitle={`${trips.filter(t => t.status === 'Completed').length} completed total`} icon={Route} />
      </div>
    </div>
  );
}
