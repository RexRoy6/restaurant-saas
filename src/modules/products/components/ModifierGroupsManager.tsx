
"use client";

import { useState } from "react";
import {
    Pencil,
    Plus,
    RefreshCw,
    SlidersHorizontal,
    Trash2,
} from "lucide-react";

import { useModifierGroups } from "../hooks/useModifierGroups";
import ModifierGroupForm from "./ModifierGroupForm";
import ModifierOptionForm from "./ModifierOptionForm";

import type {
    ModifierGroup,
    ModifierGroupInput,
    ModifierOption,
    ModifierOptionInput,
} from "../types/modifier";
import InactiveModifiersManager from "./InactiveModifiersManager";

function formatCurrency(priceInCents: number) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
    }).format(priceInCents / 100);
}

export default function ModifierGroupsManager() {
    const [showRecovery, setShowRecovery] = useState(false);
    const {
        groups,
        loading,
        saving,
        error,
        loadGroups,
        addGroup,
        editGroup,
        removeGroup,
        addOption,
        editOption,
        removeOption,
    } = useModifierGroups();

    const [showGroupForm, setShowGroupForm] =
        useState(false);

    const [editingGroup, setEditingGroup] =
        useState<ModifierGroup | null>(null);

    const [optionGroupId, setOptionGroupId] =
        useState<number | null>(null);

    const [editingOption, setEditingOption] =
        useState<ModifierOption | null>(null);

    const [actionError, setActionError] = useState("");

    const openCreateGroup = () => {
        setEditingGroup(null);
        setShowGroupForm(true);
        setActionError("");
    };

    const openEditGroup = (group: ModifierGroup) => {
        setEditingGroup(group);
        setShowGroupForm(true);
        setActionError("");
    };

    const closeGroupForm = () => {
        if (saving) return;

        setShowGroupForm(false);
        setEditingGroup(null);
    };

    const handleSaveGroup = async (
        input: ModifierGroupInput,
    ) => {
        if (editingGroup) {
            await editGroup(editingGroup.id, input);
        } else {
            await addGroup(input);
        }

        setShowGroupForm(false);
        setEditingGroup(null);
    };

    const openCreateOption = (groupId: number) => {
        setOptionGroupId(groupId);
        setEditingOption(null);
        setActionError("");
    };

    const openEditOption = (
        groupId: number,
        option: ModifierOption,
    ) => {
        setOptionGroupId(groupId);
        setEditingOption(option);
        setActionError("");
    };

    const closeOptionForm = () => {
        if (saving) return;

        setOptionGroupId(null);
        setEditingOption(null);
    };

    const handleSaveOption = async (
        input: ModifierOptionInput,
    ) => {
        if (optionGroupId === null) return;

        if (editingOption) {
            await editOption(editingOption.id, input);
        } else {
            await addOption(optionGroupId, input);
        }

        setOptionGroupId(null);
        setEditingOption(null);
    };

    const handleToggleAvailability = async (
        option: ModifierOption,
    ) => {
        setActionError("");

        try {
            await editOption(option.id, {
                isAvailable: !option.isAvailable,
            });
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "No se pudo cambiar la disponibilidad.",
            );
        }
    };

    const handleRemoveOption = async (
        option: ModifierOption,
    ) => {
        const confirmed = window.confirm(
            `¿Desactivar la opción "${option.name}"?\n\n` +
            "Dejará de aparecer en los grupos activos. " +
            "Los pedidos históricos no se modificarán.",
        );

        if (!confirmed) return;

        setActionError("");

        try {
            await removeOption(option.id);
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "No se pudo desactivar la opción.",
            );
        }
    };

    const handleRemoveGroup = async (
        group: ModifierGroup,
    ) => {
        const confirmed = window.confirm(
            `¿Desactivar el grupo "${group.name}"?\n\n` +
            "Dejará de ofrecerse en los productos " +
            "que lo tengan asignado.",
        );

        if (!confirmed) return;

        setActionError("");

        try {
            await removeGroup(group.id);
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "No se pudo desactivar el grupo.",
            );
        }
    };

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Grupos de modificadores
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Configura grupos y opciones reutilizables
                        entre diferentes productos.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => void loadGroups()}
                        disabled={loading || saving}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw size={16} />
                        Actualizar
                    </button>

                    <button
                        type="button"
                        onClick={openCreateGroup}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                    >
                        <Plus size={17} />
                        Nuevo grupo
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowRecovery((current) => !current)}
                        disabled={saving}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        {showRecovery
                            ? "Ocultar recuperación"
                            : "Recuperar modificadores"}
                    </button>

                </div>

                {showRecovery && (
                    <div className="mt-6">
                        <InactiveModifiersManager
                            activeGroups={groups.map((group) => ({
                                id: group.id,
                                name: group.name,
                            }))}
                            onRestored={loadGroups}
                        />
                    </div>
                )}
            </div>

            {(error || actionError) && (
                <div
                    role="alert"
                    className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {actionError || error}
                </div>
            )}

            {loading ? (
                <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
                    Cargando modificadores...
                </div>
            ) : groups.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-10 text-center">
                    <SlidersHorizontal
                        size={30}
                        className="mx-auto text-gray-400"
                    />

                    <h3 className="mt-3 font-medium text-gray-900">
                        Todavía no hay grupos de modificadores
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Crea tu primer grupo para comenzar.
                    </p>
                </div>
            ) : (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {group.name}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Mínimo: {group.minSelections} ·
                                        Máximo: {group.maxSelections}
                                    </p>
                                </div>

                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                    {group.options.length} opciones
                                </span>
                            </div>

                            <div className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
                                {group.options.length === 0 ? (
                                    <p className="py-4 text-sm text-gray-400">
                                        Sin opciones configuradas.
                                    </p>
                                ) : (
                                    group.options.map((option) => (
                                        <div
                                            key={option.id}
                                            className="flex flex-wrap items-center justify-between gap-3 py-3"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {option.name}
                                                </p>

                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    {formatCurrency(
                                                        option.priceInCents,
                                                    )}
                                                </p>

                                                {!option.isAvailable && (
                                                    <p className="mt-1 text-xs text-amber-600">
                                                        No disponible
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleToggleAvailability(option)
                                                    }
                                                    disabled={saving}
                                                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    {option.isAvailable
                                                        ? "No disponible"
                                                        : "Activar"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditOption(group.id, option)
                                                    }
                                                    disabled={saving}
                                                    aria-label={`Editar ${option.name}`}
                                                    className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    <Pencil size={15} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleRemoveOption(option)
                                                    }
                                                    disabled={saving}
                                                    aria-label={`Desactivar ${option.name}`}
                                                    className="rounded-lg border border-red-100 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => openCreateOption(group.id)}
                                    disabled={saving}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <Plus size={15} />
                                    Agregar opción
                                </button>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEditGroup(group)}
                                        disabled={saving}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <Pencil size={15} />
                                        Editar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            void handleRemoveGroup(group)
                                        }
                                        disabled={saving}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                    >
                                        <Trash2 size={15} />
                                        Desactivar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showGroupForm && (
                <ModifierGroupForm
                    key={editingGroup?.id ?? "new"}
                    group={editingGroup}
                    saving={saving}
                    onClose={closeGroupForm}
                    onSave={handleSaveGroup}
                />
            )}

            {optionGroupId !== null && (
                <ModifierOptionForm
                    key={editingOption?.id ?? `new-${optionGroupId}`}
                    option={editingOption}
                    saving={saving}
                    onClose={closeOptionForm}
                    onSave={handleSaveOption}
                />
            )}
        </>
    );
}