"use client";

import { Wallet } from "lucide-react";

import SearchBar from "@/app/components/crm/SearchBar";
import ErrorBox from "@/app/components/ErrorBox";
import Pagination from "@/app/components/crm/Pagination";

import PaymentForm from "@/app/components/crm/payments/PaymentForm";
import PaymentList from "@/app/components/crm/payments/PaymentList";

import { useCompanyPayments } from "@/app/hooks/useCompanyPayments"; 
import PageHeader from "@/app/components/crm/PageHeader";

export default function PaymentsPage() {
  const {
    payments,
    loading,
    error,
    errorCode,
    pagination,
    search,
    setSearch,
    page,
    setPage,
    fetchPayments,
  } = useCompanyPayments();

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      
      {/* ===================== HEADER ===================== */}
      <PageHeader 
        title="Historial de Pagos" 
        icon={Wallet}
        action={<PaymentForm onSuccess={fetchPayments} />} 
      />

      {/* ===================== BUSCADOR Y CONTADOR ===================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="w-full max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por cliente, evento o folio..."
          />
        </div>
        
        {!loading && pagination?.total !== undefined && (
          <span className="inline-flex items-center justify-center px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full border border-gray-200 uppercase tracking-wider shrink-0 w-fit">
            {pagination.total} {pagination.total === 1 ? 'Pago Encontrado' : 'Pagos Encontrados'}
          </span>
        )}
      </div>

      {/* ===================== ERRORES ===================== */}
      {error && <ErrorBox message={error} code={errorCode} />}

      {/* ===================== ESTADO DE CARGA (SKELETON) ===================== */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className="h-20 bg-gray-50 rounded-xl border border-gray-100 animate-pulse w-full"
            ></div>
          ))}
        </div>
      ) : (
        /* ===================== LISTA DE PAGOS ===================== */
        <div className="w-full animate-in fade-in duration-300">
          <PaymentList payments={payments} />
        </div>
      )}

      {/* ===================== PAGINACIÓN ===================== */}
      {pagination && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
      
    </div>
  );
}