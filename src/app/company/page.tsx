"use client";

import { Home } from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import { useSales } from "@/modules/sales/hooks/useSales";
import SalesPeriodSelector from "@/modules/sales/components/SalesPeriodSelector";

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

        {loading && (
          <p className="mt-4 text-sm text-gray-500">
            Cargando ventas...
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          summary && (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-gray-700">
                Total vendido:{" "}
                <strong>
                  {formatCurrency(
                    summary.totalSalesInCents,
                  )}
                </strong>
              </p>

              <p className="text-sm text-gray-700">
                Cuentas pagadas:{" "}
                <strong>
                  {formatNumber(
                    summary.paidChecks,
                  )}
                </strong>
              </p>

              <p className="text-sm text-gray-700">
                Productos vendidos:{" "}
                <strong>
                  {formatNumber(
                    summary.productsSold,
                  )}
                </strong>
              </p>

              <p className="text-sm text-gray-500">
                Productos en el resumen:{" "}
                {formatNumber(
                  summary.products.length,
                )}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}