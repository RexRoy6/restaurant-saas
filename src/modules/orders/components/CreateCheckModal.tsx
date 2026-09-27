"use client";

import {
    useState,
} from "react";

import { X } from "lucide-react";

import type {
    CreateCheckInput,
} from "../types/order";

type CreateCheckModalProps = {
    saving: boolean;
    error: string | null;
    onClose: () => void;
    onCreate: (
        input: CreateCheckInput,
    ) => Promise<boolean>;
};

type CheckFormState = {
    name: string;
    note: string;
};

const emptyForm: CheckFormState = {
    name: "",
    note: "",
};

export default function CreateCheckModal({
    saving,
    error,
    onClose,
    onCreate,
}: CreateCheckModalProps) {
    const [form, setForm] =
        useState<CheckFormState>(emptyForm);

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

        const name = form.name.trim();
        const note = form.note.trim();

        if (name.length > 255) {
            setFormError(
                "El nombre no puede superar los 255 caracteres.",
            );
            return;
        }

        if (note.length > 500) {
            setFormError(
                "La nota no puede superar los 500 caracteres.",
            );
            return;
        }

        const input: CreateCheckInput = {};

        if (name) {
            input.name = name;
        }

        if (note) {
            input.note = note;
        }

        const success =
            await onCreate(input);

        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Nueva cuenta
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Crea una cuenta para comenzar a tomar órdenes.
                        </p>
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
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Nombre
                            </label>

                            <input
                                type="text"
                                maxLength={255}
                                value={form.name}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        name: event.target.value,
                                    })
                                }
                                disabled={saving}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 disabled:bg-gray-50"
                                placeholder="Ej. Mesa 4"
                                autoFocus
                            />

                            <p className="mt-1.5 text-xs text-gray-400">
                                Puedes usar una mesa, nombre del cliente o referencia.
                            </p>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Nota
                            </label>

                            <textarea
                                maxLength={500}
                                rows={3}
                                value={form.note}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        note: event.target.value,
                                    })
                                }
                                disabled={saving}
                                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 disabled:bg-gray-50"
                                placeholder="Opcional"
                            />
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
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving
                                ? "Creando..."
                                : "Crear cuenta"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}