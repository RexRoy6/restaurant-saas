export type Category = {
  id: number;
  companyId: number;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type CategoryInput = {
  name: string;
  sortOrder: number;
};