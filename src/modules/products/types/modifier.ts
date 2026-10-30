
export type ModifierOption = {
  id: number;
  companyId: number;
  groupId: number;
  name: string;
  priceInCents: number;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ModifierGroup = {
  id: number;
  companyId: number;
  name: string;
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  options: ModifierOption[];
};

export type ModifierGroupInput = {
  name: string;
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
};

export type ModifierGroupUpdateInput =
  Partial<ModifierGroupInput>;

export type ModifierOptionInput = {
  name: string;
  priceInCents: number;
  isAvailable: boolean;
  sortOrder: number;
};

export type ModifierOptionUpdateInput =
  Partial<ModifierOptionInput>;
