"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  cancelOrder,
  createOrder,
  createPayment,
  getCheck,
  updateOrderStatus,
} from "../services/orders.service";

import type {
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

  const loadCheck =
    useCallback(async () => {
      if (checkId === null) {
        setCheck(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data =
          await getCheck(checkId);

        setCheck(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar la cuenta",
        );
      } finally {
        setLoading(false);
      }
    }, [checkId]);

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

    loadCheck,
    addOrder,
    changeOrderStatus,
    cancelExistingOrder,
    addPayment,
  };
}