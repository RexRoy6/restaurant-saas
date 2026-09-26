export type Product = {
  id: number;
  companyId: number;
  categoryId: number;
  name: string;
  sku: string;
  priceInCents: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ProductInput = {
  categoryId: number;
  name: string;
  sku: string;
  priceInCents: number;
};