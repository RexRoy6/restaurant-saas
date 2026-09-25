"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardCard from "@/app/components/DashboardCard";
import Toast from "@/app/components/Toast";
import PageHeader from "@/app/components/PageHeader";
import { Home } from "lucide-react";

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("es-MX").format(num);
};

const formatCurrency = (num: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(num);
};

export default function CompanyDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const meRes = await fetch("/api/company/me", {
        credentials: "include",
      });

      if (meRes.status === 401) {
        router.replace("/");
        return;
      }

      if (!meRes.ok) {
        throw new Error("No se pudo verificar la sesión");
      }

      const dashRes = await fetch("/api/company/dashboard", {
        credentials: "include",
      });

      if (!dashRes.ok) {
        throw new Error("No se pudieron cargar las métricas");
      }

      const dashData = await dashRes.json();

      setStats(dashData);
    } catch (err: any) {
      setError(err.message || "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

 return (
    <div className="relative">
      <PageHeader title="Inicio" icon={Home} />

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Dashboard
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Las métricas del negocio estarán disponibles próximamente.
        </p>
      </div>
    </div>
  );
}