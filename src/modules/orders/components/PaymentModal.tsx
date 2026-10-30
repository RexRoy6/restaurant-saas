"use client";
import { useEffect, useRef, useState } from "react";
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
  paymentStorageKey: string;
  onPaymentAttemptCleared: () => void;
  remainingInCents: number;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onPay: (
    input: CreatePaymentInput,
  ) => Promise<boolean>;
  onVerifyPayment?: (
    input: CreatePaymentInput,
  ) => Promise<"CONFIRMED" | "PENDING" | "MISMATCH">;
};

function formatCurrency(
  amountInCents: number,
) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amountInCents / 100);
}
function readStoredPaymentAttempt(
  storageKey: string,
): CreatePaymentInput | null {
  const stored = sessionStorage.getItem(storageKey);

  if (stored === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("idempotencyKey" in parsed) ||
      typeof parsed.idempotencyKey !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        parsed.idempotencyKey,
      ) ||
      !("amountInCents" in parsed) ||
      typeof parsed.amountInCents !== "number" ||
      !Number.isSafeInteger(parsed.amountInCents) ||
      parsed.amountInCents <= 0 ||
      !("paymentMethod" in parsed) ||
      (
        parsed.paymentMethod !== "CASH" &&
        parsed.paymentMethod !== "CARD" &&
        parsed.paymentMethod !== "TRANSFER"
      )
    ) {
      return null;
    }

    return {
      idempotencyKey: parsed.idempotencyKey,
      amountInCents: parsed.amountInCents,
      paymentMethod: parsed.paymentMethod,
    };
  } catch {
    return null;
  }
}

export default function PaymentModal({
  paymentStorageKey,
  onPaymentAttemptCleared,
  remainingInCents,
  saving,
  error,
  onClose,
  onPay,
  onVerifyPayment,
}: PaymentModalProps) {
  const [amount, setAmount] =
    useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<PaymentMethod>("CASH");

  const [formError, setFormError] =
    useState("");

  const paymentAttemptRef = useRef<{
    idempotencyKey: string;
    amountInCents: number;
    paymentMethod: PaymentMethod;
  } | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [paymentPendingVerification, setPaymentPendingVerification] =
    useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  useEffect(() => {
    setStorageReady(false);

    try {
      const storedValue = sessionStorage.getItem(
        paymentStorageKey,
      );

      if (storedValue !== null) {
        const attempt = readStoredPaymentAttempt(
          paymentStorageKey,
        );

        if (!attempt) {
          setFormError(
            "Existe un intento de pago guardado, " +
            "pero sus datos no son válidos. " +
            "No realices otro cobro hasta revisarlo.",
          );
          return;
        }

        paymentAttemptRef.current = attempt;
        setPaymentPendingVerification(true);
        setAmount(
          (attempt.amountInCents / 100).toFixed(2),
        );

        setPaymentMethod(attempt.paymentMethod);

        setFormError(
          "Se recuperó un intento de pago anterior. " +
          "Verifica su resultado antes de continuar.",
        );
      }

      setStorageReady(true);
    } catch {
      setFormError(
        "No se pudo acceder al almacenamiento " +
        "de intentos de pago.",
      );
    }
  }, [paymentStorageKey]);
  const handleClose = () => {
    if (saving) {
      return;
    }

    if (paymentAttemptRef.current !== null) {
      setFormError(
        "Ya se envió un intento de pago. " +
        "No cierres esta ventana hasta confirmar " +
        "si el pago fue registrado.",
      );
      return;
    }

    onClose();
  };

  const handlePayRemaining = () => {
    setAmount(
      (remainingInCents / 100).toFixed(2),
    );
  };
  const handleVerifyPayment = async () => {
    if (
      saving ||
      verifyingPayment ||
      !storageReady ||
      !paymentPendingVerification
    ) {
      return;
    }

    const attempt = paymentAttemptRef.current;

    if (!attempt || !onVerifyPayment) {
      setFormError(
        "No se puede verificar este intento de pago. " +
        "No realices otro cobro hasta revisarlo.",
      );
      return;
    }

    setVerifyingPayment(true);

    try {
      const result = await onVerifyPayment(attempt);

      if (result === "CONFIRMED") {
        try {
          sessionStorage.removeItem(paymentStorageKey);
        } catch {
          setFormError(
            "El pago fue confirmado, pero no se pudo " +
            "limpiar su registro local. " +
            "No intentes cobrar nuevamente.",
          );
          return;
        }

        paymentAttemptRef.current = null;
        setPaymentPendingVerification(false);
        setFormError("");

        onPaymentAttemptCleared();
        onClose();
        return;
      }

      if (result === "MISMATCH") {
        setFormError(
          "ALERTA: existe un pago con este identificador, " +
          "pero el monto o método no coincide. " +
          "No realices otro cobro. Solicita una revisión.",
        );
        return;
      }

      setFormError(
        "El pago todavía no se puede confirmar. " +
        "El intento permanece bloqueado. " +
        "No realices otro cobro hasta verificarlo.",
      );
    } catch {
      setFormError(
        "No se pudo consultar el estado del pago. " +
        "El intento permanece bloqueado. " +
        "Verifica tu conexión y vuelve a consultar.",
      );
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (paymentAttemptRef.current !== null) {
      setFormError(
        "Ya existe un intento de pago pendiente. " +
        "Verifica su resultado antes de realizar otro cobro.",
      );
      return;
    }

    if (!storageReady) {
      setFormError(
        "No se ha podido verificar el intento " +
        "de pago guardado. No se enviará " +
        "ningún cobro.",
      );
      return;
    }

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

    const attempt = {
      idempotencyKey: crypto.randomUUID(),
      amountInCents,
      paymentMethod,
    };

    try {
      sessionStorage.setItem(
        paymentStorageKey,
        JSON.stringify(attempt),
      );
    } catch {
      setFormError(
        "No se pudo guardar el intento de pago. " +
        "No se enviará el cobro para evitar duplicados.",
      );
      return;
    }

    paymentAttemptRef.current = attempt;
    setPaymentPendingVerification(true);

    const success = await onPay(attempt);

    if (success) {
      try {
        sessionStorage.removeItem(paymentStorageKey);
      } catch {
        setFormError(
          "El pago fue confirmado, pero no se pudo " +
          "limpiar su registro local. " +
          "No intentes cobrar nuevamente.",
        );
        return;
      }

      paymentAttemptRef.current = null;
      setPaymentPendingVerification(false);
      onPaymentAttemptCleared();
      onClose();
    } else {
      setFormError(
        "No se pudo confirmar el resultado del pago. " +
        "Es posible que ya se haya registrado. " +
        "No realices otro cobro hasta verificarlo.",
      );
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
          {paymentPendingVerification && (
            <div className="mt-5">
              <button
                type="button"
                onClick={handleVerifyPayment}
                disabled={
                  saving ||
                  verifyingPayment ||
                  !storageReady ||
                  !onVerifyPayment
                }
                className="w-full rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verifyingPayment
                  ? "Verificando estado del pago..."
                  : "Verificar estado del pago"}
              </button>

              <p className="mt-2 text-xs text-amber-800">
                Esta consulta no registra otro cobro.
                El intento original permanece protegido
                hasta confirmar su resultado.
              </p>
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
                !storageReady ||
                paymentPendingVerification ||
                remainingInCents <= 0
              }
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Registrando..."
                : paymentPendingVerification
                  ? "Pago pendiente de verificación"
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