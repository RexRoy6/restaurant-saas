"use client";

import { useState } from "react";
import {
  Banknote,
  CreditCard,
  Landmark,
  X,
} from "lucide-react";

import type {
  CreatePaymentInput,
  PaymentMethod,
} from "../types/order";

type PaymentModalProps = {
  remainingInCents: number;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onPay: (
    input: CreatePaymentInput,
  ) => Promise<boolean>;
};

function formatCurrency(
  amountInCents: number,
) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amountInCents / 100);
}

export default function PaymentModal({
  remainingInCents,
  saving,
  error,
  onClose,
  onPay,
}: PaymentModalProps) {
  const [amount, setAmount] =
    useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<PaymentMethod>("CASH");

  const [formError, setFormError] =
    useState("");

  const handleClose = () => {
    if (saving) {
      return;
    }

    onClose();
  };

  const handlePayRemaining = () => {
    setAmount(
      (remainingInCents / 100).toFixed(2),
    );
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setFormError("");

    const normalizedAmount =
      amount.trim().replace(",", ".");

    const amountAsNumber =
      Number(normalizedAmount);

    if (
      !Number.isFinite(amountAsNumber) ||
      amountAsNumber <= 0
    ) {
      setFormError(
        "Ingresa un monto válido mayor a cero.",
      );
      return;
    }

    const amountInCents = Math.round(
      amountAsNumber * 100,
    );

    if (
      !Number.isSafeInteger(
        amountInCents,
      ) ||
      amountInCents <= 0
    ) {
      setFormError(
        "El monto ingresado no es válido.",
      );
      return;
    }

    if (
      amountInCents >
      remainingInCents
    ) {
      setFormError(
        "El pago no puede superar el saldo restante.",
      );
      return;
    }

    const success = await onPay({
      amountInCents,
      paymentMethod,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Registrar pago
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Saldo restante:{" "}
              <span className="font-medium text-gray-700">
                {formatCurrency(
                  remainingInCents,
                )}
              </span>
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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Monto
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  $
                </span>

                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  autoFocus
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-7 pr-3 text-sm outline-none transition focus:border-gray-400 disabled:bg-gray-50"
                />
              </div>

              <button
                type="button"
                onClick={
                  handlePayRemaining
                }
                disabled={saving}
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Todo
              </button>
            </div>

            <p className="mt-1.5 text-xs text-gray-400">
              Puedes registrar un pago
              parcial o liquidar el saldo.
            </p>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Método de pago
            </p>

            <div className="grid gap-2 sm:grid-cols-3">
              <PaymentMethodButton
                selected={
                  paymentMethod === "CASH"
                }
                icon={
                  <Banknote size={18} />
                }
                label="Efectivo"
                onClick={() =>
                  setPaymentMethod("CASH")
                }
              />

              <PaymentMethodButton
                selected={
                  paymentMethod === "CARD"
                }
                icon={
                  <CreditCard size={18} />
                }
                label="Tarjeta"
                onClick={() =>
                  setPaymentMethod("CARD")
                }
              />

              <PaymentMethodButton
                selected={
                  paymentMethod ===
                  "TRANSFER"
                }
                icon={
                  <Landmark size={18} />
                }
                label="Transferencia"
                onClick={() =>
                  setPaymentMethod(
                    "TRANSFER",
                  )
                }
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
              disabled={
                saving ||
                remainingInCents <= 0
              }
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Registrando..."
                : "Registrar pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type PaymentMethodButtonProps = {
  selected: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

function PaymentMethodButton({
  selected,
  icon,
  label,
  onClick,
}: PaymentMethodButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? "flex items-center justify-center gap-2 rounded-lg border border-gray-900 bg-gray-900 px-3 py-2.5 text-sm font-medium text-white"
          : "flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
      }
    >
      {icon}
      {label}
    </button>
  );
}