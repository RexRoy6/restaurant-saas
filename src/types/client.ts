export interface Client {
  id: number;
  companyId: number;
  userId: number | null;

  name: string;
  phone: string;
  email: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ClientPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClientsResponse {
  data: Client[];
  pagination: ClientPagination;
}