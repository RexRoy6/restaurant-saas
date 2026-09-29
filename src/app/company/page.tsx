"use client";

import { Home } from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import { useSales } from "@/modules/sales/hooks/useSales";
import SalesPeriodSelector from "@/modules/sales/components/SalesPeriodSelector";
import DashboardCard from "@/app/components/DashboardCard";
import SalesProductsTable from "@/modules/sales/components/SalesProductsTable";
import SalesDashboardSkeleton from "@/modules/sales/components/SalesDashboardSkeleton";

const formatNumber = (num: number) => {
  return new Intl.NumberFormat(
    "es-MX",
  ).format(num);
};

const formatCurrency = (
  cents: number,
) => {
  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
    },
  ).format(cents / 100);
};

export default function CompanyDashboard() {
  const {
    period,
    setPeriod,
    summary,
    loading,
    error,
    loadSales,
  } = useSales();

  return (
    <div className="relative">
      <PageHeader
        title="Inicio"
        icon={Home}
      />

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Ventas
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Resumen de ventas del período seleccionado.
            </p>
          </div>

          <SalesPeriodSelector
            period={period}
            onChange={setPeriod}
            disabled={loading}
          />
        </div>

        {loading && !summary && (
          <SalesDashboardSkeleton />
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              No se pudieron cargar las ventas
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void loadSales()}
              className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              Reintentar
            </button>
          </div>
        )}

        {summary && !error && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <DashboardCard
                title="Total vendido"
                value={formatCurrency(
                  summary.totalSalesInCents,
                )}
              />

              <DashboardCard
                title="Cuentas pagadas"
                value={formatNumber(
                  summary.paidChecks,
                )}
              />

              <DashboardCard
                title="Productos vendidos"
                value={formatNumber(
                  summary.productsSold,
                )}
              />
            </div>

            <SalesProductsTable
              products={summary.products}
            />
          </div>
        )}


      </div>
    </div>
  );
}