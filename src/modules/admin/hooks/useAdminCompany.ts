import { useEffect, useState } from "react";
import { Company, User, CompanyDashboard } from "../types/admin";
import { fetchCompanyDashboard } from "../services/adminService";

export function useAdminCompany(companyId: string) {

  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"team" | "events" | "services">(
    "team",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suspendConfirm, setSuspendConfirm] = useState(false);
  const [reactivateConfirm, setReactivateConfirm] = useState(false);
  const [dashboard, setDashboard] = useState<CompanyDashboard | null>(null);


  //error estates
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const [companyRes, usersRes] = await Promise.all([
          fetch(`/api/admin/companies/${companyId}`),
          fetch(`/api/admin/companies/${companyId}/users`),
        ]);

        if (!companyRes.ok) throw new Error("Error empresa");
        if (!usersRes.ok) throw new Error("Error usuarios");

        const companyData = await companyRes.json();
        const usersData = await usersRes.json();

        setCompany(companyData);
        setUsers(usersData);
      } catch (err: any) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);


  const handleSuspend = async () => {
    if (!suspendConfirm) {
      setSuspendConfirm(true);
      return;
    }

    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error suspendiendo la empresa");
      }

      const updatedCompany = await res.json();

      setCompany(updatedCompany);
      setSuspendConfirm(false);
    } catch (err: any) {
      setActionError(err.message || "Error suspendiendo la empresa");
      setSuspendConfirm(false);
    }
  };

  const handleReactivate = async () => {
    if (!reactivateConfirm) {
      setReactivateConfirm(true);
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/companies/${companyId}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (res.status === 409) {
        setActionError("La empresa ya está activa");
        setReactivateConfirm(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Error reactivando la empresa");
      }

      const updatedCompany = await res.json();

      setCompany(updatedCompany);
      setReactivateConfirm(false);

    } catch (err: any) {
      setActionError(
        err.message || "Error reactivando la empresa"
      );
      setReactivateConfirm(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const result = await fetchCompanyDashboard(companyId);

      setDashboard(result);
    } catch {
      setError("Error al cargar dashboard");
    }
  };

  useEffect(() => {
    if (activeTab === "events") {
      loadDashboard();
    }
  }, [activeTab]);



  //crear users:
  const createOwner = async (
    email: string,
    password: string,
    role: "owner" | "employee"
  ) => {
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) throw new Error("Error creando usuario");

      //  refrescar usuarios
      const usersRes = await fetch(`/api/admin/companies/${companyId}/users`);
      const usersData = await usersRes.json();
      setUsers(usersData);
    } catch (err: any) {
      setActionError(err.message);
    }

  };

  //desactivar usuarios
  const deactivateUser = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.status === 409) {
        setActionError("El usuario ya estaba desactivado");
        return;
      }

      if (!res.ok) throw new Error("Error desactivando usuario");


      // refrescar
      const usersRes = await fetch(`/api/admin/companies/${companyId}/users`);
      const usersData = await usersRes.json();
      setUsers(usersData);
    } catch (err: any) {
      setActionError(err.message);
    }
  };


  /// reacticar user
  const reactivateUser = async (userId: number) => {
    try {
      const res = await fetch(
        `/api/admin/users/${userId}?reactivate=true`,
        {
          method: "PATCH",
        }
      );

      if (res.status === 409) {
        setActionError("El usuario ya estaba activo");
        return;
      }

      if (!res.ok) throw new Error("Error reactivando usuario");

      // refrescar lista
      const usersRes = await fetch(`/api/admin/companies/${companyId}/users`);
      const usersData = await usersRes.json();
      setUsers(usersData);

    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const clearActionError = () => setActionError(null);

  return {
    company,
    users,
    dashboard,
    activeTab,
    setActiveTab,
    loading,
    loadError,
    actionError,
    clearActionError,

    suspendConfirm,
    setSuspendConfirm,

    reactivateConfirm,
    setReactivateConfirm,


    handleSuspend,
    handleReactivate,

    createOwner,
    deactivateUser,
    reactivateUser,
  };
}
