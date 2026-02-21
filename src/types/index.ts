export type UserRole = 'fleet_manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst';

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
export type VehicleType = 'Truck' | 'Van' | 'Bike';
export type DriverStatus = 'Available' | 'On Duty' | 'Off Duty' | 'Suspended';
export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  licensePlate: string;
  type: VehicleType;
  maxCapacity: number;
  odometer: number;
  status: VehicleStatus;
  region: string;
  acquisitionCost: number;
}

export interface Driver {
  id: string;
  name: string;
  licenseCategory: string;
  licenseExpiry: string;
  status: DriverStatus;
  tripCompletionRate: number;
  safetyScore: number;
  avatar?: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  origin: string;
  destination: string;
  distance: number;
  status: TripStatus;
  createdAt: string;
  completedAt?: string;
  revenue: number;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  serviceType: string;
  cost: number;
  date: string;
  notes: string;
  completed: boolean;
}

export interface FuelLog {
  id: string;
  tripId: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
}

export interface KPIData {
  activeFleet: number;
  maintenanceAlerts: number;
  utilizationRate: number;
  pendingCargo: number;
  totalVehicles: number;
  totalDrivers: number;
}
