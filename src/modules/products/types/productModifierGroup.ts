
import type { ModifierGroup } from "./modifier";

export type ProductModifierGroupAssignment = {
  assignmentId: number;
  sortOrder: number;
  group: ModifierGroup;
};

export type AssignModifierGroupInput = {
  groupId: number;
  sortOrder: number;
};