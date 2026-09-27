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
import OrderCard from "./OrderCard";
import CancelOrderModal from "./CancelOrderModal";
import PaymentModal from "./PaymentModal";
import PaymentsHistory from "./PaymentsHistory";

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
        changeOrderStatus,
        cancelExistingOrder,
        addPayment,
        clearError,
    } = useCheck(checkId);

    const [
        showOrderModal,
        setShowOrderModal,
    ] = useState(false);
    const [
        cancellingOrderId,
        setCancellingOrderId,
    ] = useState<number | null>(null);
    const [
        showPaymentModal,
        setShowPaymentModal,
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

    if (error && !check) {
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
        <>
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
                                onClick={() => {
                                    clearError();
                                    setShowOrderModal(true);
                                }}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    saving={saving}
                                    readOnly={
                                        check.status !== "OPEN"
                                    }
                                    canCancel={
                                        check.status === "OPEN" &&
                                        check.paidInCents === 0
                                    }
                                    onStatusChange={
                                        changeOrderStatus
                                    }
                                    onCancel={(orderId) => {
                                        clearError();

                                        setCancellingOrderId(
                                            orderId,
                                        );
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
                {check.status === "OPEN" &&
                    check.remainingInCents > 0 && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    clearError();
                                    setShowPaymentModal(true);
                                }}
                                disabled={saving}
                                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cobrar
                            </button>
                        </div>
                    )}

                <PaymentsHistory
                    payments={check.payments}
                />

            </div>

            {showOrderModal &&
                check.status === "OPEN" && (
                    <CreateOrderModal
                        saving={saving}
                        error={error}
                        onClose={() => {
                            clearError();
                            setShowOrderModal(false);
                        }}
                        onCreate={
                            handleCreateOrder
                        }
                    />
                )}
            {cancellingOrderId !== null && (
                <CancelOrderModal
                    orderId={
                        cancellingOrderId
                    }
                    saving={saving}
                    error={error}
                    onClose={() => {
                        clearError();

                        setCancellingOrderId(
                            null,
                        );
                    }}
                    onCancel={
                        cancelExistingOrder
                    }
                />
            )}
            {showPaymentModal && (
                <PaymentModal
                    remainingInCents={
                        check.remainingInCents
                    }
                    saving={saving}
                    error={error}
                    onClose={() => {
                        clearError();
                        setShowPaymentModal(false);
                    }}
                    onPay={addPayment}
                />
            )}
        </>
    );

}