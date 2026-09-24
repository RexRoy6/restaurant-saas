"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardCard from "@/app/components/DashboardCard";
import Toast from "@/app/components/Toast";
import PageHeader from "@/app/components/crm/PageHeader";
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

      {error && (
        <Toast
          message={error}
          onClose={() => setError("")}
        />
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 13 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-between h-full p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mt-4" />
            </div>
          ))}
        </div>
      )}

      {!loading && stats && (
        <div className="space-y-10">

          {/* ====================== */}
          {/* RESUMEN GENERAL */}
          {/* ====================== */}

          <section>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📊 Resumen General
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

              <DashboardCard
                title="Clientes"
                value={formatNumber(stats.overview.clients)}
                href="/company/clients"
              />

              <DashboardCard
                title="Eventos"
                value={formatNumber(stats.overview.events)}
                href="/company/events"
              />

              <DashboardCard
                title="Contratos Activos"
                value={formatNumber(stats.overview.activeContracts)}
                href="/company/contracts"
              />

              <DashboardCard
                title="Ventas Totales"
                value={formatCurrency(stats.overview.totalSold)}
                href="/company/contracts"
              />

              <DashboardCard
                title="Cobrado"
                value={formatCurrency(stats.overview.totalPaid)}
                href="/company/payments"
              />

              <DashboardCard
                title="Saldo Pendiente"
                value={formatCurrency(stats.overview.pendingPayments)}
                href="/company/payments"
              />

            </div>

          </section>

          {/* ====================== */}
          {/* ESTE MES */}
          {/* ====================== */}

          <section>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📅 Este Mes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

              <DashboardCard
                title="Ingresos del Mes"
                value={formatCurrency(stats.monthly.revenueThisMonth)}
                href="/company/payments"
              />

              <DashboardCard
                title="Ingresos Mes Pasado"
                value={formatCurrency(stats.monthly.revenueLastMonth)}
                href="/company/payments"
              />

              <DashboardCard
                title="Clientes Nuevos"
                value={formatNumber(stats.monthly.newClients)}
                href="/company/clients"
              />

              <DashboardCard
                title="Contratos Nuevos"
                value={formatNumber(stats.monthly.newContracts)}
                href="/company/contracts"
              />

              <DashboardCard
                title="Eventos del Mes"
                value={formatNumber(stats.monthly.events)}
                href="/company/events"
              />

            </div>

          </section>

          {/* ====================== */}
          {/* PRÓXIMOS EVENTOS */}
          {/* ====================== */}

          <section>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🗓 Próximos Eventos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <DashboardCard
                title="Eventos Hoy"
                value={formatNumber(stats.upcoming.today)}
                href="/company/events"
              />

              <DashboardCard
                title="Próximos 7 Días"
                value={formatNumber(stats.upcoming.next7Days)}
                href="/company/events"
              />

            </div>

          </section>

        </div>
      )}
    </div>
  );
}