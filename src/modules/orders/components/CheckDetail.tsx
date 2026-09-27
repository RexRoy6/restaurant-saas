"use client";
import { useState } from "react";
import Link from "next/link";

import {
    ArrowLeft,
    Banknote,
    CreditCard,
    Plus,
    ReceiptText,
    WalletCards,
} from "lucide-react";

import { useCheck } from "../hooks/useCheck";
import CreateOrderModal from "./CreateOrderModal";

type CheckDetailProps = {
    checkId: number;
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

export default function CheckDetail({
    checkId,
}: CheckDetailProps) {
    const {
        check,
        loading,
        saving,
        error,
        addOrder,
    } = useCheck(checkId);

    const [
        showOrderModal,
        setShowOrderModal,
    ] = useState(false);

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-gray-500">
                    Cargando cuenta...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <Link
                    href="/company/orders"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    <ArrowLeft size={17} />
                    Volver a órdenes
                </Link>

                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    if (!check) {
        return null;
    }

    const handleCreateOrder = async (
        input: Parameters<
            typeof addOrder
        >[0],
    ) => {
        return addOrder(input);
    };


    return (
        <div className="space-y-6">
            <div>
                <Link
                    href="/company/orders"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
                >
                    <ArrowLeft size={17} />
                    Volver a órdenes
                </Link>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {check.name?.trim() ||
                                    `Cuenta #${check.id}`}
                            </h2>

                            <span
                                className={
                                    check.status === "OPEN"
                                        ? "inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                                        : "inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                                }
                            >
                                {check.status === "OPEN"
                                    ? "Abierta"
                                    : check.status === "CLOSED"
                                        ? "Cerrada"
                                        : "Cancelada"}
                            </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                            Creada {formatDate(check.createdAt)}
                        </p>

                        {check.note && (
                            <p className="mt-3 text-sm text-gray-700">
                                {check.note}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ReceiptText size={18} />
                        #{check.id}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <WalletCards size={18} />
                        Total
                    </div>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {formatCurrency(
                            check.totalInCents,
                        )}
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CreditCard size={18} />
                        Pagado
                    </div>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {formatCurrency(
                            check.paidInCents,
                        )}
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Banknote size={18} />
                        Restante
                    </div>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {formatCurrency(
                            check.remainingInCents,
                        )}
                    </p>
                </div>
            </div>


            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">

                <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            Órdenes
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Órdenes registradas en esta cuenta.
                        </p>
                    </div>

                    {check.status === "OPEN" && (
                        <button
                            type="button"
                            onClick={() =>
                                setShowOrderModal(true)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            <Plus size={17} />
                            Agregar productos
                        </button>
                    )}
                </div>


                {check.orders.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                            <ReceiptText size={22} />
                        </div>

                        <p className="mt-4 font-medium text-gray-900">
                            Todavía no hay órdenes
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Los productos agregados a esta cuenta aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {check.orders.map((order) => (
                            <div
                                key={order.id}
                                className="px-5 py-4"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Orden #{order.id}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            {formatDate(
                                                order.createdAt,
                                            )}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            {formatCurrency(
                                                order.totalInCents,
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs font-medium text-gray-500">
                                            {order.status}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between gap-4 text-sm"
                                        >
                                            <div className="min-w-0">
                                                <span className="text-gray-700">
                                                    {item.quantity} ×{" "}
                                                    {item.productName}
                                                </span>

                                                <span className="ml-2 text-xs text-gray-400">
                                                    {item.categoryName}
                                                </span>
                                            </div>

                                            <span className="shrink-0 text-gray-600">
                                                {formatCurrency(
                                                    item.subtotalInCents,
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {order.status ===
                                    "CANCELLED" && (
                                        <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
                                            Cancelada
                                            {order.cancellationReason
                                                ? `: ${order.cancellationReason}`
                                                : ""}
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}