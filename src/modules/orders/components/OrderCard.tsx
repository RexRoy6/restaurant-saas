import {
  Ban,
  CheckCircle2,
  ChefHat,
  Circle,
  Clock3,
  PackageCheck,
} from "lucide-react";

import type {
  Order,
  OrderStatus,
} from "../types/order";

type OrderCardProps = {
  order: Order;
};

function formatCurrency(
  amountInCents: number,
) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amountInCents / 100);
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

function getStatusLabel(
  status: OrderStatus,
) {
  switch (status) {
    case "PENDING":
      return "Pendiente";

    case "PREPARING":
      return "Preparando";

    case "READY":
      return "Lista";

    case "DELIVERED":
      return "Entregada";

    case "CANCELLED":
      return "Cancelada";
  }
}

function getStatusClasses(
  status: OrderStatus,
) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700";

    case "PREPARING":
      return "bg-blue-50 text-blue-700";

    case "READY":
      return "bg-purple-50 text-purple-700";

    case "DELIVERED":
      return "bg-green-50 text-green-700";

    case "CANCELLED":
      return "bg-gray-100 text-gray-600";
  }
}

function StatusIcon({
  status,
}: {
  status: OrderStatus;
}) {
  switch (status) {
    case "PENDING":
      return <Clock3 size={15} />;

    case "PREPARING":
      return <ChefHat size={15} />;

    case "READY":
      return <PackageCheck size={15} />;

    case "DELIVERED":
      return <CheckCircle2 size={15} />;

    case "CANCELLED":
      return <Ban size={15} />;
  }
}

export default function OrderCard({
  order,
}: OrderCardProps) {
  const cancelled =
    order.status === "CANCELLED";

  return (
    <div
      className={
        cancelled
          ? "bg-gray-50/70 px-5 py-5"
          : "bg-white px-5 py-5"
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className={
                cancelled
                  ? "font-semibold text-gray-500"
                  : "font-semibold text-gray-900"
              }
            >
              Orden #{order.id}
            </h4>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                order.status,
              )}`}
            >
              <StatusIcon
                status={order.status}
              />

              {getStatusLabel(
                order.status,
              )}
            </span>
          </div>

          <p className="mt-1.5 text-xs text-gray-400">
            {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="sm:text-right">
          <p
            className={
              cancelled
                ? "text-lg font-semibold text-gray-400 line-through"
                : "text-lg font-semibold text-gray-900"
            }
          >
            {formatCurrency(
              order.totalInCents,
            )}
          </p>

          <p className="mt-0.5 text-xs text-gray-400">
            {order.items.length}{" "}
            {order.items.length === 1
              ? "partida"
              : "partidas"}
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
        {order.items.map(
          (item, index) => (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 ${
                index !==
                order.items.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-7 min-w-7 items-center justify-center rounded-md bg-gray-100 px-1.5 text-xs font-semibold text-gray-600">
                  {item.quantity}×
                </div>

                <div className="min-w-0">
                  <p
                    className={
                      cancelled
                        ? "truncate text-sm font-medium text-gray-500"
                        : "truncate text-sm font-medium text-gray-800"
                    }
                  >
                    {item.productName}
                  </p>

                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                    <span>
                      {item.categoryName}
                    </span>

                    <span>
                      {formatCurrency(
                        item.unitPriceInCents,
                      )}{" "}
                      c/u
                    </span>
                  </div>
                </div>
              </div>

              <span
                className={
                  cancelled
                    ? "shrink-0 text-sm font-medium text-gray-400"
                    : "shrink-0 text-sm font-medium text-gray-700"
                }
              >
                {formatCurrency(
                  item.subtotalInCents,
                )}
              </span>
            </div>
          ),
        )}
      </div>

      {cancelled && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <div className="flex items-start gap-2">
            <Circle
              size={8}
              className="mt-1.5 shrink-0 fill-gray-400 text-gray-400"
            />

            <div>
              <p className="text-sm font-medium text-gray-600">
                Orden cancelada
              </p>

              {order.cancellationReason && (
                <p className="mt-1 text-sm text-gray-500">
                  {order.cancellationReason}
                </p>
              )}

              {order.cancelledAt && (
                <p className="mt-1 text-xs text-gray-400">
                  {formatDate(
                    order.cancelledAt,
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}