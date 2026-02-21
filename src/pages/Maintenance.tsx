import { useState } from 'react';
import { useFleetStore } from '@/stores/fleetStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';
import { toast } from 'sonner';

export default function MaintenancePage() {
  const { maintenanceLogs, vehicles, addMaintenance, completeMaintenance, getVehicleById } = useFleetStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', serviceType: '', cost: 0, date: '', notes: '', completed: false });

  const handleAdd = () => {
    if (!form.vehicleId || !form.serviceType || !form.date) {
      toast.error('Please fill required fields');
      return;
    }
    addMaintenance(form);
    setModalOpen(false);
    setForm({ vehicleId: '', serviceType: '', cost: 0, date: '', notes: '', completed: false });
    toast.success('Maintenance log added — vehicle set to "In Shop"');
  };

  // Only show non-retired vehicles for maintenance
  const eligibleVehicles = vehicles.filter((v) => v.status !== 'Retired');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Maintenance"
        description="Track vehicle service and repairs"
        actions={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Log</Button>}
      />

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Cost</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceLogs.map((m) => {
                const v = getVehicleById(m.vehicleId);
                return (
                  <tr key={m.id}>
                    <td className="font-medium">{v?.name || m.vehicleId}</td>
                    <td>{m.serviceType}</td>
                    <td>{formatCurrency(m.cost)}</td>
                    <td className="text-xs">{m.date}</td>
                    <td className="max-w-[200px] truncate text-xs text-muted-foreground">{m.notes}</td>
                    <td>
                      <StatusBadge status={m.completed ? 'Completed' : 'In Shop'} />
                    </td>
                    <td>
                      {!m.completed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { completeMaintenance(m.id); toast.success('Maintenance completed — vehicle available'); }}
                          className="h-7 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {maintenanceLogs.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No maintenance records.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Maintenance Log</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Vehicle *</Label>
              <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {eligibleVehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name} ({v.licensePlate})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Type *</Label>
                <Input value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} placeholder="e.g. Oil Change" />
              </div>
              <div className="space-y-2">
                <Label>Cost (€)</Label>
                <Input type="number" value={form.cost || ''} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional details..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
