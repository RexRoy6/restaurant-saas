"use client";

import { useEffect, useState } from "react";

import {
  fetchClients,
  createClient,
  deleteClient,
  updateClient,
} from "@/services/clients/clientApi";

import type {
  Client,
  ClientPagination,
} from "@/types/client";

export function useClients() {
  /* ---------- state ---------- */

  const [clients, setClients] = useState<Client[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* ---------- filters ---------- */

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const limit = 10;

  /* ---------- pagination ---------- */

  const [pagination, setPagination] =
    useState<ClientPagination>({
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
    });

  /* ---------- load ---------- */

  async function loadClients() {
    try {
      setLoading(true);

      const data = await fetchClients({
        search,
        page,
        limit,
      });

      setClients(data.data);

      setPagination(data.pagination);

      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- create ---------- */

  async function handleCreateClient(data: {
    name: string;
    phone: string;
    email?: string;
  }) {
    try {
      await createClient(data);

      await loadClients();
    } catch (err: any) {
      setError(err.message || "Failed to create client");
    }
  }

  /* ---------- delete ---------- */

  async function handleDeleteClient(id: number) {
    try {
      await deleteClient(id);

      await loadClients();
    } catch (err: any) {
      setError(err.message || "Failed to delete client");
    }
  }

  /* ---------- update ---------- */

  async function handleUpdateClient(
    id: number,
    data: {
      name?: string;
      phone?: string;
      email?: string;
    }
  ) {
    try {
      await updateClient(id, data);

      await loadClients();
    } catch (err: any) {
      setError(err.message || "Failed to update client");
    }
  }

  /* ---------- reset page on search ---------- */

  useEffect(() => {
    setPage(1);
  }, [search]);

  /* ---------- debounce fetch ---------- */

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadClients();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, page]);

  /* ---------- expose ---------- */

  return {
    clients,

    loading,

    error,

    search,
    setSearch,

    page,
    setPage,

    pagination,

    reload: loadClients,

    createClient: handleCreateClient,

    deleteClient: handleDeleteClient,

    updateClient: handleUpdateClient,
  };
}