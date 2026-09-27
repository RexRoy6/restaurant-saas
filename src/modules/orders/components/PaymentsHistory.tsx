import {
  Banknote,
  CreditCard,
  Landmark,
  ReceiptText,
} from "lucide-react";

import type {
  Payment,
  PaymentMethod,
} from "../types/order";

type PaymentsHistoryProps = {
  payments: Payment[];
};

function formatCurrency(
  amountInCents: number,
) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amountInCents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

function getPaymentMethodLabel(
  method: PaymentMethod,
) {
  switch (method) {
    case "CASH":
      return "Efectivo";

    case "CARD":
      return "Tarjeta";

    case "TRANSFER":
      return "Transferencia";
  }
}

function PaymentMethodIcon({
  method,
}: {
  method: PaymentMethod;
}) {
  switch (method) {
    case "CASH":
      return <Banknote size={18} />;

    case "CARD":
      return <CreditCard size={18} />;

    case "TRANSFER":
      return <Landmark size={18} />;
  }
}

export default function PaymentsHistory({
  payments,
}: PaymentsHistoryProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          <ReceiptText size={18} />
        </div>

        <div>
          <h2 className="font-semibold text-gray-900">
            Pagos
          </h2>

          <p className="text-sm text-gray-500">
            Historial de pagos registrados
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-gray-500">
            Todavía no hay pagos registrados.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <PaymentMethodIcon
                    method={
                      payment.paymentMethod
                    }
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getPaymentMethodLabel(
                      payment.paymentMethod,
                    )}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatDate(
                      payment.paidAt,
                    )}
                  </p>
                </div>
              </div>

              <p className="text-base font-semibold text-gray-900">
                {formatCurrency(
                  payment.amountInCents,
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}