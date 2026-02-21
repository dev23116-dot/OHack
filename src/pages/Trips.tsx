import { useState } from 'react';
import { useFleetStore } from '@/stores/fleetStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Play, CheckCircle, XCircle } from 'lucide-react';
import { TripStatus } from '@/types';
import { formatNumber, formatCurrency } from '@/lib/helpers';
import { toast } from 'sonner';

export default function TripsPage() {
  const { trips, vehicles, drivers, addTrip, updateTripStatus, getAvailableVehicles, getAvailableDrivers, getVehicleById, getDriverById } = useFleetStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', driverId: '', cargoWeight: 0, origin: '', destination: '', distance: 0, revenue: 0 });

  const availableVehicles = getAvailableVehicles();
  const availableDrivers = getAvailableDrivers();

  const handleCreate = () => {
    if (!form.vehicleId || !form.driverId || !form.origin || !form.destination) {
      toast.error('Please fill all required fields');
      return;
    }
    const vehicle = getVehicleById(form.vehicleId);
    if (vehicle && form.cargoWeight > vehicle.maxCapacity) {
      toast.error(`Cargo weight exceeds vehicle capacity (${formatNumber(vehicle.maxCapacity)} kg)`);
      return;
    }
    addTrip({ ...form, status: 'Draft' as TripStatus });
    setModalOpen(false);
    setForm({ vehicleId: '', driverId: '', cargoWeight: 0, origin: '', destination: '', distance: 0, revenue: 0 });
    toast.success('Trip created as Draft');
  };

  const statusActions = (tripId: string, status: TripStatus) => {
    const actions: { label: string; newStatus: TripStatus; icon: any; variant: 'default' | 'outline' | 'destructive' }[] = [];
    if (status === 'Draft') actions.push({ label: 'Dispatch', newStatus: 'Dispatched', icon: Play, variant: 'default' });
    if (status === 'Dispatched') {
      actions.push({ label: 'Complete', newStatus: 'Completed', icon: CheckCircle, variant: 'default' });
      actions.push({ label: 'Cancel', newStatus: 'Cancelled', icon: XCircle, variant: 'destructive' });
    }
    return actions.map((a) => (
      <Button
        key={a.newStatus}
        size="sm"
        variant={a.variant as any}
        onClick={() => { updateTripStatus(tripId, a.newStatus); toast.success(`Trip ${a.newStatus.toLowerCase()}`); }}
        className="h-7 text-xs"
      >
        <a.icon className="h-3 w-3 mr-1" />
        {a.label}
      </Button>
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Trip Dispatcher"
        description="Create and manage fleet trips"
        actions={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4 mr-2" />New Trip</Button>}
      />

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Route</th>
                <th>Cargo</th>
                <th>Revenue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => {
                const v = getVehicleById(t.vehicleId);
                const d = getDriverById(t.driverId);
                return (
                  <tr key={t.id}>
                    <td className="font-mono text-xs">{t.id.toUpperCase()}</td>
                    <td>{v?.name || t.vehicleId}</td>
                    <td>{d?.name || t.driverId}</td>
                    <td>
                      <div className="text-xs">
                        <span className="font-medium">{t.origin}</span>
                        <span className="text-muted-foreground"> → </span>
                        <span className="font-medium">{t.destination}</span>
                      </div>
                      {t.distance > 0 && <div className="text-[10px] text-muted-foreground">{t.distance} km</div>}
                    </td>
                    <td>{formatNumber(t.cargoWeight)} kg</td>
                    <td>{formatCurrency(t.revenue)}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">{statusActions(t.id, t.status)}</div>
                    </td>
                  </tr>
                );
              })}
              {trips.length === 0 && (
                <tr><td colSpan={8} className="text-center text-muted-foreground py-8">No trips yet. Create one to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Trip</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vehicle (Available only) *</Label>
                <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name} ({formatNumber(v.maxCapacity)} kg)</SelectItem>
                    ))}
                    {availableVehicles.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">No available vehicles</div>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Driver (Available only) *</Label>
                <Select value={form.driverId} onValueChange={(v) => setForm({ ...form, driverId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                    {availableDrivers.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">No available drivers</div>}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Origin *</Label>
                <Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="e.g. Hamburg" />
              </div>
              <div className="space-y-2">
                <Label>Destination *</Label>
                <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="e.g. Munich" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cargo Weight (kg)</Label>
                <Input type="number" value={form.cargoWeight || ''} onChange={(e) => setForm({ ...form, cargoWeight: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Distance (km)</Label>
                <Input type="number" value={form.distance || ''} onChange={(e) => setForm({ ...form, distance: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Revenue (€)</Label>
                <Input type="number" value={form.revenue || ''} onChange={(e) => setForm({ ...form, revenue: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Trip</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
