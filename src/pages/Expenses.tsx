import { useState } from 'react';
import { useFleetStore } from '@/stores/fleetStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/helpers';
import { toast } from 'sonner';

export default function ExpensesPage() {
  const { trips, fuelLogs, vehicles, addFuelLog, getVehicleById, getTotalFuelCost, getTotalMaintenanceCost } = useFleetStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ tripId: '', vehicleId: '', liters: 0, cost: 0, date: '' });

  const completedTrips = trips.filter((t) => t.status === 'Completed');

  const handleAdd = () => {
    if (!form.tripId || !form.liters || !form.cost || !form.date) {
      toast.error('Please fill all fields');
      return;
    }
    const trip = trips.find((t) => t.id === form.tripId);
    addFuelLog({ ...form, vehicleId: trip?.vehicleId || '' });
    setModalOpen(false);
    setForm({ tripId: '', vehicleId: '', liters: 0, cost: 0, date: '' });
    toast.success('Fuel log added');
  };

  // Cost summary per vehicle
  const vehicleCosts = vehicles.map((v) => {
    const fuel = getTotalFuelCost(v.id);
    const maintenance = getTotalMaintenanceCost(v.id);
    return { ...v, fuelCost: fuel, maintenanceCost: maintenance, totalCost: fuel + maintenance };
  }).filter((v) => v.totalCost > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Expenses & Fuel"
        description="Track fuel consumption and operational costs"
        actions={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4 mr-2" />Log Fuel</Button>}
      />

      {/* Fuel Logs */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Fuel Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Vehicle</th>
                <th>Liters</th>
                <th>Cost</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {fuelLogs.map((f) => {
                const v = getVehicleById(f.vehicleId);
                return (
                  <tr key={f.id}>
                    <td className="font-mono text-xs">{f.tripId.toUpperCase()}</td>
                    <td>{v?.name || f.vehicleId}</td>
                    <td>{f.liters} L</td>
                    <td>{formatCurrency(f.cost)}</td>
                    <td className="text-xs">{f.date}</td>
                  </tr>
                );
              })}
              {fuelLogs.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No fuel logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Cost Summary per Vehicle</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Fuel Total</th>
                <th>Maintenance Total</th>
                <th>Total Operational Cost</th>
              </tr>
            </thead>
            <tbody>
              {vehicleCosts.map((v) => (
                <tr key={v.id}>
                  <td className="font-medium">{v.name}</td>
                  <td>{formatCurrency(v.fuelCost)}</td>
                  <td>{formatCurrency(v.maintenanceCost)}</td>
                  <td className="font-semibold">{formatCurrency(v.totalCost)}</td>
                </tr>
              ))}
              {vehicleCosts.length === 0 && (
                <tr><td colSpan={4} className="text-center text-muted-foreground py-8">No cost data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Fuel</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Completed Trip *</Label>
              <Select value={form.tripId} onValueChange={(v) => setForm({ ...form, tripId: v })}>
                <SelectTrigger><SelectValue placeholder="Select trip" /></SelectTrigger>
                <SelectContent>
                  {completedTrips.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.id.toUpperCase()} — {t.origin} → {t.destination}
                    </SelectItem>
                  ))}
                  {completedTrips.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">No completed trips</div>}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Liters *</Label>
                <Input type="number" value={form.liters || ''} onChange={(e) => setForm({ ...form, liters: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Cost (€) *</Label>
                <Input type="number" value={form.cost || ''} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Fuel Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
