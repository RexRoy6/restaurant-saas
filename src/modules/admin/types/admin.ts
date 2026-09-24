export interface Company {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface User {
  id: number;
  company_id: number;
  name: string;
  email: string;
  role: string;
  deletedAt: Date | null;
}

export interface Metrics {
  total: number;
  active: number;
  newSignups: number;
}

export interface Contract {
  id: number;
  company_id: number;
  client_id: number;
  event_date: Date;
  status: string;
  total_amount: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export interface services {
  company_id: number;
  stock_total: number;
  price_base: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export interface DashboardActivity {
  clients: number;
  newClientsThisMonth: number;
  contractsTotal: number;
  contractsThisMonth: number;
  eventsTotal: number;
  eventsThisMonth: number;
  paymentsTotal: number;
  employees: number;
}

export interface CompanyDashboard {
  activity: DashboardActivity;
}