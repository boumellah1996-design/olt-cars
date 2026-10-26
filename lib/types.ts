export type Locale = "ar" | "fr" | "en" | "es";
export type Theme = "light" | "dark";
export type PickupType = "agency" | "airport" | "delivery";
export type VehicleStatus = "available" | "rented" | "reserved" | "maintenance" | "unavailable";
export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "converted";
export type RentalStatus = "active" | "late" | "completed";
export type Fuel = "essence" | "diesel" | "hybrid" | "electric";
export type Transmission = "auto" | "manual";

export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  category: string;
  fuel: Fuel;
  transmission: Transmission;
  pricePerDay: number;
  image: string;
  status: VehicleStatus;
  seats: number;
  year: number;
  plate: string;
  color: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  license: string;
  createdAt: string;
};

export type Reservation = {
  id: string;
  code: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  vehicleId: string;
  pickupType: PickupType;
  location: string;
  startAt: string;
  endAt: string;
  status: ReservationStatus;
  total: number;
  createdAt: string;
};

export type Rental = {
  id: string;
  code: string;
  reservationId?: string;
  clientName: string;
  clientPhone: string;
  vehicleId: string;
  startAt: string;
  endAt: string;
  status: RentalStatus;
  total: number;
  paid: number;
  createdAt: string;
};

export type Payment = {
  id: string;
  rentalId?: string;
  clientName: string;
  amount: number;
  method: "cash" | "card" | "transfer";
  at: string;
  note?: string;
};

export type Expense = {
  id: string;
  category: string;
  amount: number;
  at: string;
  note: string;
};

export type Maintenance = {
  id: string;
  vehicleId: string;
  type: string;
  status: "open" | "done";
  startAt: string;
  cost: number;
  note: string;
};

export type FleetDocument = {
  id: string;
  vehicleId?: string;
  type: string;
  name: string;
  expiresAt?: string;
};

export type Incident = {
  id: string;
  vehicleId: string;
  title: string;
  severity: "low" | "medium" | "high";
  status: "open" | "closed";
  at: string;
  note: string;
};

export type CashMovement = {
  id: string;
  type: "in" | "out";
  amount: number;
  at: string;
  note: string;
};

export type Activity = {
  id: string;
  messageFr: string;
  messageAr: string;
  detailFr: string;
  detailAr: string;
  at: string;
};

export type SearchQuery = {
  pickupType: PickupType;
  location: string;
  startAt: string;
  endAt: string;
};

export type AppState = {
  vehicles: Vehicle[];
  clients: Client[];
  reservations: Reservation[];
  rentals: Rental[];
  payments: Payment[];
  expenses: Expense[];
  maintenances: Maintenance[];
  documents: FleetDocument[];
  incidents: Incident[];
  cash: CashMovement[];
  activities: Activity[];
};
