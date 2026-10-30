
"use client";

import { useState } from "react";
import {
  ArchiveRestore,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";

import { useInactiveModifiers } from "../hooks/useInactiveModifiers";

type Props = {
  activeGroups: {
    id: number;
    name: string;
  }[];
  onRestored: () => Promise<void>;
};

export default function InactiveModifiersManager({
  activeGroups,
  onRestored,
}: Props) {
  const {
    inactiveGroups,
    inactiveOptions,
    loading,
    saving,
    error,
    loadInactiveGroups,
    loadInactiveOptions,
    reactivateGroup,
    reactivateOption,
  } = useInactiveModifiers();

  const [mode, setMode] = useState<
    "groups" | "options"
  >("groups");

  const [selectedGroupId, setSelectedGroupId] =
    useState<number | null>(null);

  const [actionError, setActionError] = useState("");

  const selectedGroup = activeGroups.find(
    (group) => group.id === selectedGroupId,
  );

  const showInactiveGroups = async () => {
    setMode("groups");
    setActionError("");
    await loadInactiveGroups();
  };

  const showInactiveOptions = async (
    groupId: number,
  ) => {
    setSelectedGroupId(groupId);
    setMode("options");
    setActionError("");
    await loadInactiveOptions(groupId);
  };

  const handleRestoreGroup = async (
    groupId: number,
  ) => {
    setActionError("");

    try {
      await reactivateGroup(groupId);
      await onRestored();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo restaurar el grupo.",
      );
    }
  };

  const handleRestoreOption = async (
    optionId: number,
  ) => {
    if (selectedGroupId === null) return;

    setActionError("");

    try {
      await reactivateOption(
        selectedGroupId,
        optionId,
      );
      await onRestored();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo restaurar la opción.",
      );
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            Recuperar modificadores
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Restaura grupos u opciones eliminadas
            anteriormente.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void showInactiveGroups()}
          disabled={loading || saving}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Grupos desactivados
        </button>
      </div>

      <div className="mt-5">
        {mode === "groups" ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">
                Grupos desactivados
              </h4>

              <button
                type="button"
                onClick={() => void loadInactiveGroups()}
                disabled={loading || saving}
                aria-label="Actualizar grupos desactivados"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {!loading && inactiveGroups.length === 0 && (
              <p className="py-4 text-sm text-gray-500">
                No hay grupos desactivados.
              </p>
            )}

            {inactiveGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between gap-3 border-t border-gray-100 py-3"
              >
                <span className="text-sm text-gray-800">
                  {group.name}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    void handleRestoreGroup(group.id)
                  }
                  disabled={loading || saving}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ArchiveRestore size={15} />
                  Restaurar
                </button>
              </div>
            ))}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void showInactiveGroups()}
              className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={16} />
              Volver
            </button>

            <h4 className="mb-3 text-sm font-semibold text-gray-800">
              Opciones eliminadas de{" "}
              {selectedGroup?.name ?? "grupo"}
            </h4>

            {!loading && inactiveOptions.length === 0 && (
              <p className="py-4 text-sm text-gray-500">
                No hay opciones eliminadas.
              </p>
            )}

            {inactiveOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between gap-3 border-t border-gray-100 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {option.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Recargo: $
                    {(option.priceInCents / 100).toFixed(2)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void handleRestoreOption(option.id)
                  }
                  disabled={loading || saving}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ArchiveRestore size={15} />
                  Restaurar
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {mode === "groups" && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="mb-3 text-sm font-medium text-gray-700">
            Consultar opciones eliminadas
          </p>

          <div className="flex flex-wrap gap-2">
            {activeGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() =>
                  void showInactiveOptions(group.id)
                }
                disabled={loading || saving}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <p className="mt-4 text-sm text-gray-500">
          Cargando...
        </p>
      )}

      {(error || actionError) && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {actionError || error}
        </p>
      )}
    </div>
  );
}