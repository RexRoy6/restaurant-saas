"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    cancelCheck,
    cancelOrder,
    createOrder,
    createPayment,
    getCheck,
    updateOrderStatus,
} from "../services/orders.service";

import type {
    CancelCheckInput,
    CancelOrderInput,
    Check,
    CreateOrderInput,
    CreatePaymentInput,
    UpdateOrderStatusInput,
} from "../types/order";

export function useCheck(
    checkId: number | null,
) {
    const [check, setCheck] =
        useState<Check | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);
    const clearError = () => {
        setError(null);
    };
    const [syncError, setSyncError] =
        useState<string | null>(null);
    const activeRequestRef =
        useRef<Promise<void> | null>(null);



    const loadCheck = useCallback(
        async (silent = false) => {
            if (checkId === null) {
                setCheck(null);
                setLoading(false);
                return;
            }

            // Las consultas automáticas no compiten
            // con una consulta que ya está en curso.
            if (silent && activeRequestRef.current) {
                return;
            }

            // Las consultas manuales esperan a que
            // termine cualquier consulta anterior.
            while (activeRequestRef.current) {
                await activeRequestRef.current;
            }

            const request = (async () => {
                try {
                    if (!silent) {
                        setLoading(true);
                        setError(null);
                    }

                    const data = await getCheck(checkId);

                    setCheck(data);
                    setSyncError(null);
                } catch (error) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : "No se pudo cargar la cuenta";

                    if (silent) {
                        setSyncError(message);
                    } else {
                        setError(message);
                    }
                } finally {
                    if (!silent) {
                        setLoading(false);
                    }
                }
            })();

            activeRequestRef.current = request;

            try {
                await request;
            } finally {
                if (activeRequestRef.current === request) {
                    activeRequestRef.current = null;
                }
            }
        },
        [checkId],
    );



    useEffect(() => {
        void loadCheck();
    }, [loadCheck]);


    const addOrder = async (
        input: CreateOrderInput,
    ) => {
        if (checkId === null) {
            return false;
        }

        try {
            setSaving(true);
            setError(null);

            await createOrder(
                checkId,
                input,
            );

            await loadCheck();

            return true;
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo crear la orden",
            );

            return false;
        } finally {
            setSaving(false);
        }
    };

    const changeOrderStatus = async (
        orderId: number,
        input: UpdateOrderStatusInput,
    ) => {
        try {
            setSaving(true);
            setError(null);

            await updateOrderStatus(
                orderId,
                input,
            );

            await loadCheck();

            return true;
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo actualizar la orden",
            );

            return false;
        } finally {
            setSaving(false);
        }
    };

    const cancelExistingOrder = async (
        orderId: number,
        input: CancelOrderInput,
    ) => {
        try {
            setSaving(true);
            setError(null);

            await cancelOrder(
                orderId,
                input,
            );

            await loadCheck();

            return true;
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo cancelar la orden",
            );

            return false;
        } finally {
            setSaving(false);
        }
    };
    const cancelCurrentCheck = async (
        input: CancelCheckInput,
    ) => {
        if (checkId === null) {
            return false;
        }

        try {
            setSaving(true);
            setError(null);

            await cancelCheck(
                checkId,
                input,
            );

            await loadCheck();

            return true;
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo cancelar la cuenta",
            );

            return false;
        } finally {
            setSaving(false);
        }
    };


    const addPayment = async (
        input: CreatePaymentInput,
    ) => {
        if (checkId === null) {
            return false;
        }

        try {
            setSaving(true);
            setError(null);

            await createPayment(
                checkId,
                input,
            );

            await loadCheck();

            return true;
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo registrar el pago",
            );

            return false;
        } finally {
            setSaving(false);
        }
    };

    return {
        check,
        loading,
        saving,
        error,
        syncError,

        loadCheck,
        addOrder,
        changeOrderStatus,
        cancelExistingOrder,
        cancelCurrentCheck,
        addPayment,
        clearError,
    };
}