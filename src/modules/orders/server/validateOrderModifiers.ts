
import { inArray } from "drizzle-orm";

import {
  modifierGroups,
  modifierOptions,
  productModifierGroups,
} from "@/db/schema";

import { tenantDb } from "@/lib/db/tenantDb";

type Tenant = Awaited<ReturnType<typeof tenantDb>>;

export type RequestedModifierItem = {
  productId: number;
  modifierOptionIds: number[];
};

export type ValidatedModifier = {
  groupId: number;
  optionId: number;
  groupName: string;
  optionName: string;
  priceInCents: number;
};

export type ValidatedModifierItem = {
  productId: number;
  modifiers: ValidatedModifier[];
};

export class ModifierValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModifierValidationError";
  }
}

export async function validateOrderModifiers(
  tenant: Tenant,
  items: RequestedModifierItem[],
): Promise<ValidatedModifierItem[]> {
  if (items.length === 0) {
    return [];
  }

  const productIds = [
    ...new Set(items.map((item) => item.productId)),
  ];

  const optionIds = [
    ...new Set(
      items.flatMap((item) => item.modifierOptionIds),
    ),
  ];

  // Las consultas normales de tenantDb excluyen
  // automáticamente los registros con deletedAt.
  const assignments = await tenant.findMany(
    productModifierGroups,
    inArray(productModifierGroups.productId, productIds),
  );

  const groupIds = [
    ...new Set(
      assignments.map((assignment) => assignment.groupId),
    ),
  ];

  const groups =
    groupIds.length > 0
      ? await tenant.findMany(
          modifierGroups,
          inArray(modifierGroups.id, groupIds),
        )
      : [];

  const options =
    optionIds.length > 0
      ? await tenant.findMany(
          modifierOptions,
          inArray(modifierOptions.id, optionIds),
        )
      : [];

  const groupById = new Map(
    groups.map((group) => [group.id, group]),
  );

  const optionById = new Map(
    options.map((option) => [option.id, option]),
  );

  const groupsByProduct = new Map<
    number,
    typeof groups
  >();

  for (const assignment of assignments) {
    const group = groupById.get(assignment.groupId);

    if (!group) {
      continue;
    }

    const productGroups =
      groupsByProduct.get(assignment.productId) ?? [];

    productGroups.push(group);

    groupsByProduct.set(
      assignment.productId,
      productGroups,
    );
  }

  const result: ValidatedModifierItem[] = [];

  for (const item of items) {
    const assignedGroups =
      groupsByProduct.get(item.productId) ?? [];

    const assignedGroupIds = new Set(
      assignedGroups.map((group) => group.id),
    );

    const selectedByGroup = new Map<
      number,
      ValidatedModifier[]
    >();

    for (const optionId of item.modifierOptionIds) {
      const option = optionById.get(optionId);

      if (!option || !option.isAvailable) {
        throw new ModifierValidationError(
          "Una o más opciones no están disponibles.",
        );
      }

      if (!assignedGroupIds.has(option.groupId)) {
        throw new ModifierValidationError(
          "Una opción seleccionada no pertenece a los modificadores del producto.",
        );
      }

      const group = groupById.get(option.groupId);

      if (!group) {
        throw new ModifierValidationError(
          "El grupo de una opción no está disponible.",
        );
      }

      const selected =
        selectedByGroup.get(group.id) ?? [];

      selected.push({
        groupId: group.id,
        optionId: option.id,
        groupName: group.name,
        optionName: option.name,
        priceInCents: option.priceInCents,
      });

      selectedByGroup.set(group.id, selected);
    }

    // Validamos TODOS los grupos asignados,
    // incluso aquellos sin opciones seleccionadas.
    for (const group of assignedGroups) {
      const count =
        selectedByGroup.get(group.id)?.length ?? 0;

      if (
        count < group.minSelections ||
        count > group.maxSelections
      ) {
        throw new ModifierValidationError(
          `El grupo "${group.name}" requiere entre ${group.minSelections} y ${group.maxSelections} opciones.`,
        );
      }
    }

    result.push({
      productId: item.productId,
      modifiers: [
        ...selectedByGroup.values(),
      ].flat(),
    });
  }

  return result;
}
