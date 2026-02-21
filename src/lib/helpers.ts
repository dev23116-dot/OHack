import { TripStatus, VehicleStatus, DriverStatus } from '@/types';

export function getStatusClass(status: VehicleStatus | DriverStatus | TripStatus): string {
  const map: Record<string, string> = {
    'Available': 'status-available',
    'On Trip': 'status-on-trip',
    'In Shop': 'status-in-shop',
    'Retired': 'status-retired',
    'On Duty': 'status-on-duty',
    'Off Duty': 'status-off-duty',
    'Suspended': 'status-suspended',
    'Draft': 'status-draft',
    'Dispatched': 'status-dispatched',
    'Completed': 'status-completed',
    'Cancelled': 'status-cancelled',
  };
  return map[status] || '';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}
