"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Company, User, Metrics, Timezone } from "../types/admin";
import {
  fetchCompanies,
  fetchMe,
  createCompany,
  fetchTimezones,
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
  const [newCompanyTimezoneId, setNewCompanyTimezoneId] =
    useState<number | null>(null);

  const [timezones, setTimezones] = useState<Timezone[]>([]);



  /* obtener zonas horarias */
  const loadTimezones = async () => {
    try {
      const data = await fetchTimezones();
      setTimezones(data);
    } catch {
      setError("Error al cargar zonas horarias");
    }
  };

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
    return false;
  }

  if (!newCompanyTimezoneId) {
    setError("La zona horaria es obligatoria");
    return false;
  }

  try {
    setCreating(true);
    setError("");

    await createCompany(
      newCompanyName,
      newCompanyTimezoneId,
    );

    setNewCompanyName("");
    setNewCompanyTimezoneId(null);

    await loadCompanies();

    return true;
  } catch {
    setError("Error al crear empresa");
    return false;
  } finally {
    setCreating(false);
  }
};

  useEffect(() => {
    loadUser();
    loadCompanies();
    loadTimezones();
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
    timezones,

    metrics,

    loading,
    creating,
    error,

    searchTerm,
    newCompanyName,
    newCompanyTimezoneId,

    setSearchTerm,
    setError,
    setNewCompanyName,
    setNewCompanyTimezoneId,

    createCompany: handleCreateCompany,
  };
}
