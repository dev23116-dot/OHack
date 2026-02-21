import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog } from '@/types';

export const mockVehicles: Vehicle[] = [
  { id: 'v1', name: 'Volvo FH16', model: 'FH16 750', licensePlate: 'FL-1001', type: 'Truck', maxCapacity: 25000, odometer: 145200, status: 'Available', region: 'North', acquisitionCost: 120000 },
  { id: 'v2', name: 'Mercedes Actros', model: 'Actros 2653', licensePlate: 'FL-1002', type: 'Truck', maxCapacity: 22000, odometer: 89400, status: 'On Trip', region: 'South', acquisitionCost: 115000 },
  { id: 'v3', name: 'Ford Transit', model: 'Transit 350', licensePlate: 'FL-2001', type: 'Van', maxCapacity: 1800, odometer: 52000, status: 'Available', region: 'East', acquisitionCost: 35000 },
  { id: 'v4', name: 'Scania R500', model: 'R500 V8', licensePlate: 'FL-1003', type: 'Truck', maxCapacity: 28000, odometer: 201000, status: 'In Shop', region: 'West', acquisitionCost: 135000 },
  { id: 'v5', name: 'Iveco Daily', model: 'Daily 35S', licensePlate: 'FL-2002', type: 'Van', maxCapacity: 1500, odometer: 34500, status: 'Available', region: 'North', acquisitionCost: 28000 },
  { id: 'v6', name: 'Honda CB500X', model: 'CB500X', licensePlate: 'FL-3001', type: 'Bike', maxCapacity: 50, odometer: 12300, status: 'On Trip', region: 'East', acquisitionCost: 7000 },
  { id: 'v7', name: 'MAN TGX', model: 'TGX 18.510', licensePlate: 'FL-1004', type: 'Truck', maxCapacity: 24000, odometer: 178000, status: 'Retired', region: 'South', acquisitionCost: 110000 },
  { id: 'v8', name: 'Renault Master', model: 'Master L3H2', licensePlate: 'FL-2003', type: 'Van', maxCapacity: 2000, odometer: 67800, status: 'Available', region: 'West', acquisitionCost: 32000 },
];

export const mockDrivers: Driver[] = [
  { id: 'd1', name: 'James Wilson', licenseCategory: 'CE', licenseExpiry: '2026-08-15', status: 'Available', tripCompletionRate: 96, safetyScore: 92 },
  { id: 'd2', name: 'Maria Santos', licenseCategory: 'CE', licenseExpiry: '2027-03-22', status: 'On Duty', tripCompletionRate: 98, safetyScore: 95 },
  { id: 'd3', name: 'Ahmed Khan', licenseCategory: 'C', licenseExpiry: '2025-11-30', status: 'Available', tripCompletionRate: 91, safetyScore: 88 },
  { id: 'd4', name: 'Sophie Laurent', licenseCategory: 'B', licenseExpiry: '2024-06-10', status: 'Suspended', tripCompletionRate: 85, safetyScore: 72 },
  { id: 'd5', name: 'Carlos Mendez', licenseCategory: 'CE', licenseExpiry: '2026-12-01', status: 'Off Duty', tripCompletionRate: 94, safetyScore: 90 },
  { id: 'd6', name: 'Elena Popov', licenseCategory: 'C', licenseExpiry: '2027-05-18', status: 'On Duty', tripCompletionRate: 97, safetyScore: 93 },
];

export const mockTrips: Trip[] = [
  { id: 't1', vehicleId: 'v2', driverId: 'd2', cargoWeight: 18000, origin: 'Hamburg', destination: 'Munich', distance: 780, status: 'Dispatched', createdAt: '2026-02-18', revenue: 4500 },
  { id: 't2', vehicleId: 'v6', driverId: 'd6', cargoWeight: 30, origin: 'Berlin', destination: 'Potsdam', distance: 35, status: 'Dispatched', createdAt: '2026-02-19', revenue: 120 },
  { id: 't3', vehicleId: 'v1', driverId: 'd1', cargoWeight: 20000, origin: 'Frankfurt', destination: 'Cologne', distance: 190, status: 'Completed', createdAt: '2026-02-10', completedAt: '2026-02-11', revenue: 2800 },
  { id: 't4', vehicleId: 'v3', driverId: 'd3', cargoWeight: 1200, origin: 'Stuttgart', destination: 'Nuremberg', distance: 210, status: 'Draft', createdAt: '2026-02-20', revenue: 950 },
  { id: 't5', vehicleId: 'v5', driverId: 'd5', cargoWeight: 1400, origin: 'Dusseldorf', destination: 'Dortmund', distance: 70, status: 'Completed', createdAt: '2026-02-05', completedAt: '2026-02-06', revenue: 600 },
];

export const mockMaintenanceLogs: MaintenanceLog[] = [
  { id: 'm1', vehicleId: 'v4', serviceType: 'Engine Overhaul', cost: 4500, date: '2026-02-15', notes: 'Full engine rebuild required', completed: false },
  { id: 'm2', vehicleId: 'v1', serviceType: 'Oil Change', cost: 250, date: '2026-02-01', notes: 'Routine maintenance', completed: true },
  { id: 'm3', vehicleId: 'v2', serviceType: 'Brake Replacement', cost: 1200, date: '2026-01-20', notes: 'Front and rear brake pads', completed: true },
  { id: 'm4', vehicleId: 'v7', serviceType: 'Tire Rotation', cost: 180, date: '2026-01-15', notes: 'All 6 tires rotated', completed: true },
];

export const mockFuelLogs: FuelLog[] = [
  { id: 'f1', tripId: 't3', vehicleId: 'v1', liters: 280, cost: 420, date: '2026-02-11' },
  { id: 'f2', tripId: 't5', vehicleId: 'v5', liters: 18, cost: 27, date: '2026-02-06' },
  { id: 'f3', tripId: 't1', vehicleId: 'v2', liters: 350, cost: 525, date: '2026-02-18' },
];
