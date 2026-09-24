"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Company, User, Metrics } from "../types/admin";
import {
  fetchCompanies,
  fetchMe,
  createCompany,
} from "../services/adminService";

export function useAdminDashboard() {
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [newCompanyName, setNewCompanyName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  /* obtener usuario */
  const loadUser = async () => {
    try {
      const me = await fetchMe();

      if (!me) {
        router.replace("/");
        return;
      }

      setUser(me);
    } catch {
      setError("Error al obtener usuario");
    }
  };

  /* obtener empresas */
  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await fetchCompanies();
      setCompanies(data);
    } catch {
      setError("Error al cargar empresas");
    } finally {
      setLoading(false);
    }
  };

  /* crear empresa */
  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) {
      setError("El nombre de la empresa es obligatorio");
      return;
    }

    try {
      setCreating(true);

      await createCompany(newCompanyName);

      setNewCompanyName("");
      setShowCreateModal(false);

      await loadCompanies();
    } catch {
      setError("Error al crear empresa");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadCompanies();
  }, []);

  /* métricas */

  const hoy = new Date();
  const hace7Dias = new Date(hoy);
  hace7Dias.setDate(hoy.getDate() - 7);

  const metrics: Metrics = {
    total: companies.length,

    active: companies.filter((c) => c.deletedAt == null).length,

    newSignups: companies.filter((c) => {
      const fecha = new Date(c.createdAt);
      return fecha >= hace7Dias;
    }).length,
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return {
    user,
    companies,
    filteredCompanies,

    metrics,

    loading,
    creating,
    error,

    searchTerm,
    newCompanyName,
    showCreateModal,

    setSearchTerm,
    setError,
    setNewCompanyName,
    setShowCreateModal,

    createCompany: handleCreateCompany,
  };
}
