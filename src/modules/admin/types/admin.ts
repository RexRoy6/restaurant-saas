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