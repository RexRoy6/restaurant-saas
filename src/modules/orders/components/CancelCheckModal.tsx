"use client";

import { useState } from "react";
import {
  AlertTriangle,
  X,
} from "lucide-react";

import type {
  CancelCheckInput,
} from "../types/order";

type CancelCheckModalProps = {
  checkId: number;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onCancel: (
    input: CancelCheckInput,
  ) => Promise<boolean>;
};

export default function CancelCheckModal({
  checkId,
  saving,
  error,
  onClose,
  onCancel,
}: CancelCheckModalProps) {
  const [reason, setReason] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const handleClose = () => {
    if (saving) {
      return;
    }

    onClose();
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormError("");

    const trimmedReason =
      reason.trim();

    if (!trimmedReason) {
      setFormError(
        "Escribe el motivo de la cancelación.",
      );
      return;
    }

    if (trimmedReason.length > 500) {
      setFormError(
        "El motivo no puede superar los 500 caracteres.",
      );
      return;
    }

    const success = await onCancel({
      reason: trimmedReason,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={20} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Cancelar cuenta
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Cuenta #{checkId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6"
        >
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Esta acción cancelará definitivamente
            la cuenta y dejará registrado el motivo.
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Motivo de cancelación
            </label>

            <textarea
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value,
                )
              }
              maxLength={500}
              rows={4}
              disabled={saving}
              autoFocus
              placeholder="Ej. El cliente se retiró antes de preparar la orden"
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 disabled:bg-gray-50"
            />

            <div className="mt-1.5 flex justify-between gap-3">
              <p className="text-xs text-gray-400">
                El motivo es obligatorio.
              </p>

              <p className="text-xs text-gray-400">
                {reason.length}/500
              </p>
            </div>
          </div>

          {formError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {formError}
            </div>
          )}

          {!formError && error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Volver
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Cancelando..."
                : "Cancelar cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}