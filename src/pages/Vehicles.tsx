import { useState } from 'react';
import { useFleetStore } from '@/stores/fleetStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Archive } from 'lucide-react';
import { Vehicle, VehicleType, VehicleStatus } from '@/types';
import { formatNumber } from '@/lib/helpers';
import { toast } from 'sonner';

const emptyVehicle = {
  name: '', model: '', licensePlate: '', type: 'Truck' as VehicleType,
  maxCapacity: 0, odometer: 0, status: 'Available' as VehicleStatus, region: '', acquisitionCost: 0,
};

export default function VehiclesPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, setVehicleStatus } = useFleetStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(emptyVehicle);

  const openAdd = () => { setEditing(null); setForm(emptyVehicle); setModalOpen(true); };
  const openEdit = (v: Vehicle) => { setEditing(v); setForm(v); setModalOpen(true); };

  const handleSave = () => {
    if (!form.licensePlate || !form.name || !form.maxCapacity) {
      toast.error('Please fill all required fields');
      return;
    }
    const duplicate = vehicles.find(v => v.licensePlate === form.licensePlate && v.id !== editing?.id);
    if (duplicate) {
      toast.error('License plate must be unique');
      return;
    }
    if (editing) {
      updateVehicle(editing.id, form);
      toast.success('Vehicle updated');
    } else {
      addVehicle(form);
      toast.success('Vehicle added');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Vehicle Registry"
        description="Manage your fleet inventory"
        actions={<Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Vehicle</Button>}
      />

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name / Model</th>
                <th>License Plate</th>
                <th>Type</th>
                <th>Max Capacity</th>
                <th>Odometer</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-muted-foreground">{v.model}</div>
                  </td>
                  <td className="font-mono text-xs">{v.licensePlate}</td>
                  <td>{v.type}</td>
                  <td>{formatNumber(v.maxCapacity)} kg</td>
                  <td>{formatNumber(v.odometer)} km</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(v)} className="h-8 w-8">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {v.status !== 'Retired' && (
                        <Button variant="ghost" size="icon" onClick={() => { setVehicleStatus(v.id, 'Retired'); toast.success('Vehicle retired'); }} className="h-8 w-8">
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {v.status === 'Retired' && (
                        <Button variant="ghost" size="icon" onClick={() => { setVehicleStatus(v.id, 'Available'); toast.success('Vehicle reactivated'); }} className="h-8 w-8 text-status-available">
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => { deleteVehicle(v.id); toast.success('Vehicle deleted'); }} className="h-8 w-8 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>License Plate *</Label>
                <Input value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as VehicleType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Bike">Bike</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Capacity (kg) *</Label>
                <Input type="number" value={form.maxCapacity || ''} onChange={(e) => setForm({ ...form, maxCapacity: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Odometer (km)</Label>
                <Input type="number" value={form.odometer || ''} onChange={(e) => setForm({ ...form, odometer: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Region</Label>
                <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Acquisition Cost (€)</Label>
                <Input type="number" value={form.acquisitionCost || ''} onChange={(e) => setForm({ ...form, acquisitionCost: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Add'} Vehicle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
