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
    const dataVersionRef = useRef(0);
    const abortControllerRef =
        useRef<AbortController | null>(null);
    const requestIdRef = useRef(0);
    const lifecycleVersionRef = useRef(0);
    const writingRef = useRef(false);
    const refreshingAfterWriteRef = useRef(false);


    const loadCheck = useCallback(
        async (silent = false) => {
            if (checkId === null) {
                setCheck(null);
                setLoading(false);
                return;
            }
            const lifecycleVersion = lifecycleVersionRef.current;

            if (silent && writingRef.current) {
                return;
            }

            if (silent && activeRequestRef.current) {
                return;
            }

            while (activeRequestRef.current) {
                await activeRequestRef.current;

                if (
                    lifecycleVersion !== lifecycleVersionRef.current
                ) {
                    return;
                }
            }
            if (
                lifecycleVersion !== lifecycleVersionRef.current
            ) {
                return;
            }
            const requestVersion = dataVersionRef.current;
            const requestId = ++requestIdRef.current;
            const controller = new AbortController();

            abortControllerRef.current = controller;

            const request = (async () => {
                try {
                    if (!silent) {
                        setLoading(true);
                        setError(null);
                    }

                    const data = await getCheck(
                        checkId,
                        controller.signal,
                    );
                    if (
                        controller.signal.aborted ||
                        requestId !== requestIdRef.current ||
                        requestVersion !== dataVersionRef.current ||
                        (
                            writingRef.current &&
                            !refreshingAfterWriteRef.current
                        )
                    ) {
                        return;
                    }

                    setCheck(data);
                    setSyncError(null);
                } catch (error) {
                    if (
                        requestId !== requestIdRef.current ||
                        requestVersion !== dataVersionRef.current
                    ) {
                        return;
                    }
                    // Una cancelación intencional no es un
                    // error que debamos mostrar al usuario.
                    if (controller.signal.aborted) {
                        return;
                    }

                    if (
                        requestVersion !== dataVersionRef.current
                    ) {
                        return;
                    }

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
                    if (
                        !silent &&
                        requestId === requestIdRef.current
                    ) {
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

                if (abortControllerRef.current === controller) {
                    abortControllerRef.current = null;
                }
            }
        },
        [checkId],
    );


    useEffect(() => {
        void loadCheck();

        return () => {
            lifecycleVersionRef.current += 1;
            dataVersionRef.current += 1;
            requestIdRef.current += 1;

            abortControllerRef.current?.abort();
            abortControllerRef.current = null;
        };
    }, [loadCheck]);

    useEffect(() => {
        if (checkId === null) {
            return;
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                void loadCheck(true);
            }
        };

        const intervalId = window.setInterval(() => {
            if (document.visibilityState !== "visible") {
                return;
            }

            void loadCheck(true);
        }, 5000);

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange,
        );

        return () => {
            window.clearInterval(intervalId);

            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        };
    }, [checkId, loadCheck]);


    const beginWrite = (): boolean => {
        // Ya existe una operación de escritura.
        if (writingRef.current) {
            return false;
        }

        writingRef.current = true;
        dataVersionRef.current += 1;

        // Cancelar una lectura anterior a la escritura.
        abortControllerRef.current?.abort();

        return true;
    };
    const endWrite = () => {
        refreshingAfterWriteRef.current = false;
        writingRef.current = false;
    };
    const addOrder = async (
        input: CreateOrderInput,
    ) => {
        if (checkId === null) {
            return false;
        }

        if (!beginWrite()) {
            return false;
        }

        try {
            setSaving(true);
            setError(null);

            await createOrder(
                checkId,
                input,
            );
            refreshingAfterWriteRef.current = true;
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
            endWrite();
            setSaving(false);
        }
    };

    const changeOrderStatus = async (
        orderId: number,
        input: UpdateOrderStatusInput,
    ) => {
        if (!beginWrite()) {
            return false;
        }

        try {
            setSaving(true);
            setError(null);

            await updateOrderStatus(
                orderId,
                input,
            );
            refreshingAfterWriteRef.current = true;
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
            endWrite();
            setSaving(false);
        }
    };


    const cancelExistingOrder = async (
        orderId: number,
        input: CancelOrderInput,
    ) => {
        if (!beginWrite()) {
            return false;
        }

        try {
            setSaving(true);
            setError(null);
            await cancelOrder(
                orderId,
                input,
            );
            refreshingAfterWriteRef.current = true;
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
            endWrite();
            setSaving(false);
        }
    };

    const cancelCurrentCheck = async (
        input: CancelCheckInput,
    ) => {
        if (checkId === null) {
            return false;
        }

        if (!beginWrite()) {
            return false;
        }

        try {
            setSaving(true);
            setError(null);

            await cancelCheck(
                checkId,
                input,
            );
            refreshingAfterWriteRef.current = true;
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
            endWrite();
            setSaving(false);
        }
    };


    const addPayment = async (
        input: CreatePaymentInput,
    ) => {
        if (checkId === null) {
            return false;
        }
        if (!beginWrite()) {
            return false;
        }

        try {
            setSaving(true);
            setError(null);
            await createPayment(
                checkId,
                input,
            );
            refreshingAfterWriteRef.current = true;
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
            endWrite();
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