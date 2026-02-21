import { create } from 'zustand';
import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, VehicleStatus, DriverStatus, TripStatus } from '@/types';
import { mockVehicles, mockDrivers, mockTrips, mockMaintenanceLogs, mockFuelLogs } from '@/data/mockData';

interface FleetState {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  fuelLogs: FuelLog[];

  // Vehicle actions
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  setVehicleStatus: (id: string, status: VehicleStatus) => void;

  // Driver actions
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, updates: Partial<Driver>) => void;

  // Trip actions
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => void;
  updateTripStatus: (id: string, status: TripStatus) => void;

  // Maintenance actions
  addMaintenance: (log: Omit<MaintenanceLog, 'id'>) => void;
  completeMaintenance: (id: string) => void;

  // Fuel actions
  addFuelLog: (log: Omit<FuelLog, 'id'>) => void;

  // Computed helpers
  getAvailableVehicles: () => Vehicle[];
  getAvailableDrivers: () => Driver[];
  getVehicleById: (id: string) => Vehicle | undefined;
  getDriverById: (id: string) => Driver | undefined;
  getTotalFuelCost: (vehicleId: string) => number;
  getTotalMaintenanceCost: (vehicleId: string) => number;
}

let idCounter = 100;
const genId = (prefix: string) => `${prefix}${++idCounter}`;

export const useFleetStore = create<FleetState>((set, get) => ({
  vehicles: mockVehicles,
  drivers: mockDrivers,
  trips: mockTrips,
  maintenanceLogs: mockMaintenanceLogs,
  fuelLogs: mockFuelLogs,

  addVehicle: (vehicle) =>
    set((state) => ({
      vehicles: [...state.vehicles, { ...vehicle, id: genId('v') }],
    })),

  updateVehicle: (id, updates) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    })),

  deleteVehicle: (id) =>
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== id),
    })),

  setVehicleStatus: (id, status) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, status } : v)),
    })),

  addDriver: (driver) =>
    set((state) => ({
      drivers: [...state.drivers, { ...driver, id: genId('d') }],
    })),

  updateDriver: (id, updates) =>
    set((state) => ({
      drivers: state.drivers.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),

  addTrip: (trip) =>
    set((state) => ({
      trips: [...state.trips, { ...trip, id: genId('t'), createdAt: new Date().toISOString().split('T')[0] }],
    })),

  updateTripStatus: (id, status) =>
    set((state) => {
      const trip = state.trips.find((t) => t.id === id);
      if (!trip) return state;

      const updates: Partial<{ vehicles: Vehicle[]; drivers: Driver[]; trips: Trip[] }> = {};

      const newTrips = state.trips.map((t) =>
        t.id === id
          ? { ...t, status, ...(status === 'Completed' ? { completedAt: new Date().toISOString().split('T')[0] } : {}) }
          : t
      );
      updates.trips = newTrips;

      if (status === 'Dispatched') {
        updates.vehicles = state.vehicles.map((v) =>
          v.id === trip.vehicleId ? { ...v, status: 'On Trip' as VehicleStatus } : v
        );
        updates.drivers = state.drivers.map((d) =>
          d.id === trip.driverId ? { ...d, status: 'On Duty' as DriverStatus } : d
        );
      } else if (status === 'Completed' || status === 'Cancelled') {
        // Check if vehicle/driver have other active trips
        const otherActiveTrips = state.trips.filter(
          (t) => t.id !== id && (t.status === 'Dispatched')
        );
        const vehicleHasOtherTrips = otherActiveTrips.some((t) => t.vehicleId === trip.vehicleId);
        const driverHasOtherTrips = otherActiveTrips.some((t) => t.driverId === trip.driverId);

        if (!vehicleHasOtherTrips) {
          updates.vehicles = state.vehicles.map((v) =>
            v.id === trip.vehicleId ? { ...v, status: 'Available' as VehicleStatus } : v
          );
        }
        if (!driverHasOtherTrips) {
          updates.drivers = state.drivers.map((d) =>
            d.id === trip.driverId ? { ...d, status: 'Available' as DriverStatus } : d
          );
        }
      }

      return { ...state, ...updates };
    }),

  addMaintenance: (log) =>
    set((state) => ({
      maintenanceLogs: [...state.maintenanceLogs, { ...log, id: genId('m') }],
      vehicles: state.vehicles.map((v) =>
        v.id === log.vehicleId ? { ...v, status: 'In Shop' as VehicleStatus } : v
      ),
    })),

  completeMaintenance: (id) =>
    set((state) => {
      const log = state.maintenanceLogs.find((m) => m.id === id);
      if (!log) return state;
      
      const otherActiveMaintenance = state.maintenanceLogs.filter(
        (m) => m.id !== id && m.vehicleId === log.vehicleId && !m.completed
      );

      return {
        maintenanceLogs: state.maintenanceLogs.map((m) =>
          m.id === id ? { ...m, completed: true } : m
        ),
        vehicles: otherActiveMaintenance.length === 0
          ? state.vehicles.map((v) =>
              v.id === log.vehicleId ? { ...v, status: 'Available' as VehicleStatus } : v
            )
          : state.vehicles,
      };
    }),

  addFuelLog: (log) =>
    set((state) => ({
      fuelLogs: [...state.fuelLogs, { ...log, id: genId('f') }],
    })),

  getAvailableVehicles: () => get().vehicles.filter((v) => v.status === 'Available'),
  getAvailableDrivers: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().drivers.filter(
      (d) => d.status === 'Available' && d.licenseExpiry >= today
    );
  },
  getVehicleById: (id) => get().vehicles.find((v) => v.id === id),
  getDriverById: (id) => get().drivers.find((d) => d.id === id),
  getTotalFuelCost: (vehicleId) =>
    get().fuelLogs.filter((f) => f.vehicleId === vehicleId).reduce((sum, f) => sum + f.cost, 0),
  getTotalMaintenanceCost: (vehicleId) =>
    get().maintenanceLogs.filter((m) => m.vehicleId === vehicleId).reduce((sum, m) => sum + m.cost, 0),
}));
