export interface Company {
  id: number;
  name: string;
  slug: string;
  currency: "MXN";
  timezoneId: number;

  timezone?: Timezone;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Timezone {
  id: number;
  name: string;
  label: string;
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
export interface Timezone {
  id: number;
  name: string;
  label: string;
}