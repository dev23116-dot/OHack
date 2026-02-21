import { useMemo, useState } from 'react';
import { useFleetStore } from '@/stores/fleetStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/helpers';
import { Fuel, TrendingUp, DollarSign, BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { downloadReport, triggerDownload } from '@/lib/api';
import { toast } from 'sonner';

const COLORS = ['hsl(220,70%,45%)', 'hsl(168,70%,40%)', 'hsl(30,90%,50%)', 'hsl(280,60%,55%)', 'hsl(0,72%,51%)'];

export default function AnalyticsPage() {
  const { vehicles, trips, fuelLogs, maintenanceLogs, getTotalFuelCost, getTotalMaintenanceCost } = useFleetStore();
  const [exporting, setExporting] = useState(false);

  const handleExportReport = async (format: 'csv' | 'pdf') => {
    setExporting(true);
    try {
      const blob = await downloadReport(format);
      const filename = format === 'pdf' ? 'fleetflow-report.pdf' : 'fleetflow-financial-summary.csv';
      triggerDownload(blob, filename);
      toast.success(`Report downloaded as ${format.toUpperCase()}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const completedTrips = trips.filter((t) => t.status === 'Completed');
  const totalRevenue = completedTrips.reduce((s, t) => s + t.revenue, 0);
  const totalFuel = fuelLogs.reduce((s, f) => s + f.cost, 0);
  const totalMaintenance = maintenanceLogs.reduce((s, m) => s + m.cost, 0);
  const totalDistance = completedTrips.reduce((s, t) => s + t.distance, 0);
  const totalLiters = fuelLogs.reduce((s, f) => s + f.liters, 0);
  const fuelEfficiency = totalLiters > 0 ? (totalDistance / totalLiters).toFixed(1) : '—';
  const costPerKm = totalDistance > 0 ? ((totalFuel + totalMaintenance) / totalDistance).toFixed(2) : '—';

  const vehicleROI = useMemo(() => {
    return vehicles.slice(0, 5).map((v) => {
      const revenue = completedTrips.filter((t) => t.vehicleId === v.id).reduce((s, t) => s + t.revenue, 0);
      const costs = getTotalFuelCost(v.id) + getTotalMaintenanceCost(v.id);
      const roi = v.acquisitionCost > 0 ? ((revenue - costs) / v.acquisitionCost * 100).toFixed(1) : '0';
      return { name: v.name.split(' ')[0], revenue, costs, roi: Number(roi) };
    });
  }, [vehicles, completedTrips]);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach((v) => { counts[v.status] = (counts[v.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [vehicles]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Analytics"
        description="Fleet performance metrics and insights"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExportReport('csv')} disabled={exporting}>
              <Download className="h-4 w-4 mr-2" />Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('pdf')} disabled={exporting}>
              <Download className="h-4 w-4 mr-2" />Export PDF
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} trend={{ value: 18, positive: true }} />
        <KPICard title="Fuel Efficiency" value={`${fuelEfficiency} km/L`} icon={Fuel} />
        <KPICard title="Cost per km" value={`€${costPerKm}`} icon={TrendingUp} />
        <KPICard title="Total Trips" value={completedTrips.length} subtitle={`${totalDistance.toLocaleString()} km driven`} icon={BarChart3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue vs Cost chart */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Vehicle Revenue vs Costs (Top 5)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleROI}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="hsl(220,70%,45%)" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="costs" fill="hsl(0,72%,51%)" radius={[4, 4, 0, 0]} name="Costs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet status pie */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Fleet Status Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusDistribution.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROI Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Vehicle ROI Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Revenue</th>
                <th>Total Costs</th>
                <th>Acquisition Cost</th>
                <th>ROI</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => {
                const revenue = completedTrips.filter((t) => t.vehicleId === v.id).reduce((s, t) => s + t.revenue, 0);
                const costs = getTotalFuelCost(v.id) + getTotalMaintenanceCost(v.id);
                const roi = v.acquisitionCost > 0 ? ((revenue - costs) / v.acquisitionCost * 100).toFixed(1) : '0.0';
                return (
                  <tr key={v.id}>
                    <td className="font-medium">{v.name}</td>
                    <td>{formatCurrency(revenue)}</td>
                    <td>{formatCurrency(costs)}</td>
                    <td>{formatCurrency(v.acquisitionCost)}</td>
                    <td>
                      <span className={`font-semibold ${Number(roi) >= 0 ? 'text-status-available' : 'text-destructive'}`}>
                        {roi}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
