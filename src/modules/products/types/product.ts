export type Product = {
  id: number;
  companyId: number;
  name: string;
  sku: string;
  priceInCents: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ProductInput = {
  name: string;
  sku: string;
  priceInCents: number;
};