"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  FileText, 
  ArrowRight, 
  User, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  X,
} from "lucide-react";
import ErrorBox from "@/app/components/ErrorBox";
import SearchBar from "@/app/components/crm/SearchBar";
import Pagination from "@/app/components/crm/Pagination";
import EventSearch from "@/app/components/crm/EventSearch";
import { formatDate } from "@/lib/utils/date";
import { CONTRACT_STATUS } from "@/db/schema";
import PageHeader from "@/app/components/crm/PageHeader";

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number | undefined>();

  /* Modal de creación */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Referencia para detectar clics fuera del modal
  const modalRef = useRef<HTMLDivElement>(null);

  type ContractForm = {
    eventId: string;
    status: string;
    event?: {
      name: string;
      clientName: string;
      date: string;
      location: string;
    };
  };

  const [form, setForm] = useState<ContractForm>({
    eventId: "",
    status: "draft",
    event: undefined,
  });

  // Search params y pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/company/contracts?search=${search}&page=${page}&limit=6`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        setError("Error al cargar los contratos.");
        setErrorCode(res.status);
        return;
      }

      const result = await res.json();
      setContracts(result.data);
      setPagination(result.pagination);
    } catch {
      setError("Error de conexión al cargar contratos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/company/events?limit=100", {
        credentials: "include",
      });
      if (!res.ok) return;
      const result = await res.json();
      const activeEvents = result.data.filter((e: any) => !e.deletedAt);
      setEvents(activeEvents);
    } catch { }
  };

  const createContract = async () => {
    if (!form.eventId) {
      setError("Debes seleccionar un evento.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/company/contracts", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: Number(form.eventId),
          status: form.status,
          totalAmount: 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(JSON.stringify(data.error) || "Error al crear el contrato.");
        setErrorCode(res.status);
        setIsSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      setForm({
        eventId: "",
        status: "draft",
        event: undefined,
      });
      setError("");
      fetchContracts();
    } catch {
      setError("Error de conexión al crear contrato.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchContracts();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, page]);

  // ------------------------------------------------------------------
  // 🚀 MAGIA UX: Scroll Lock + Cierre al clic exterior
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleOutsideClick = (e: MouseEvent) => {
      if (isModalOpen && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isModalOpen]);

  // Utilidades de diseño para el estado
  function getStatusConfig(status: string) {
    switch (status) {
      case "draft":
        return { bg: "bg-gray-100", text: "text-gray-700", label: "Borrador", bar: "bg-gray-400" };
      case "active":
        return { bg: "bg-blue-50", text: "text-blue-700", label: "Activo", bar: "bg-blue-500" };
      case "cancelled":
        return { bg: "bg-red-50", text: "text-red-700", label: "Cancelado", bar: "bg-red-500" };
      case "completed":
        return { bg: "bg-green-50", text: "text-green-700", label: "Completado", bar: "bg-green-500" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", label: status, bar: "bg-gray-400" };
    }
  }

  const formatMoney = (value: number = 0) =>
    `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      
      {/* ===================== HEADER & BÚSQUEDA ===================== */}
      <PageHeader 
        title="Contratos" 
        icon={FileText}
        buttonLabel="+ Nuevo Contrato"
        onClick={() => setIsModalOpen(true)}
      />

      <div className="w-full max-w-md">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por estado, cliente, evento o ubicación..."
        />
      </div>

      {error && <ErrorBox message={error} code={errorCode} />}

      {/* ===================== ESTADO DE CARGA ===================== */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl border border-gray-200 animate-pulse"></div>
          ))}
        </div>
      )}

      {/* ===================== ESTADO VACÍO ===================== */}
      {!loading && contracts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No hay contratos registrados</h3>
          <p className="text-sm text-gray-500 mb-6">No se encontraron contratos que coincidan con tu búsqueda.</p>
        </div>
      )}

      {/* ===================== GRID DE CONTRATOS ===================== */}
      {!loading && contracts.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
            {contracts.map((contract) => {
              const progress = contract.totalAmount > 0
                ? (contract.paidAmount / contract.totalAmount) * 100
                : 0;
              const statusConfig = getStatusConfig(contract.status);

              return (
                <div
                  key={contract.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between group"
                >
                  {/* Cabecera Tarjeta */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <h3 className="font-bold text-gray-900 text-lg">
                        Contrato #{contract.id}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5 truncate" title={contract.event?.name}>
                        <Calendar size={14} className="text-gray-400" />
                        {contract.event?.name || "Sin evento vinculado"}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-5 text-sm font-medium text-gray-700">
                    <User size={15} className="text-gray-400" />
                    {contract.client?.name || "Sin cliente"}
                  </div>

                  {/* Resumen Financiero */}
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-3.5 flex flex-col gap-2.5 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Monto Pagado</span>
                      <span className="font-semibold text-gray-900">{formatMoney(contract.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Monto Total</span>
                      <span className="font-semibold text-gray-900">{formatMoney(contract.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2.5 border-t border-gray-200">
                      <span className="text-gray-500">Saldo Restante</span>
                      <span className="font-semibold text-gray-900">{formatMoney(contract.remainingAmount)}</span>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="flex flex-col gap-1.5 mb-5">
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${statusConfig.bar} transition-all duration-500`} 
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-gray-500 text-right uppercase tracking-wider">
                      {Math.round(progress)}% Pagado
                    </span>
                  </div>

                  {/* Acción */}
                  <div className="pt-4 border-t border-gray-100 mt-auto flex justify-end">
                    <Link
                      href={`/company/contracts/${contract.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200"
                    >
                      Administrar
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {pagination && (
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* ===================== MODAL DE CREACIÓN INLINE ===================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div 
            ref={modalRef} 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 my-auto"
          >
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Generar Contrato</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-5 sm:p-6 flex flex-col gap-5 sm:gap-6">
              
              {/* Selector de Evento */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700 ml-1">
                  Buscar Evento Vinculado <span className="text-red-500">*</span>
                </label>
                  <EventSearch
                    onSelect={(event: any) => {
                      setForm((prev) => ({
                        ...prev,
                        eventId: String(event.id),
                        event: {
                          name: event.name,
                          clientName: event.client?.name,
                          date: event.eventDate,
                          location: event.location,
                        },
                      }));
                    }}
                  />
              </div>

              {/* Vista previa del evento seleccionado */}
              {form.event && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                    <span className="truncate">{form.event.name}</span>
                  </div>
                  <div className="text-xs font-medium text-gray-500 ml-6 truncate">
                    Cliente: <span className="text-gray-700">{form.event.clientName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-medium text-gray-500 ml-6 mt-1">
                    <span className="flex items-center gap-1.5"><Calendar size={12}/> {formatDate(form.event.date)}</span>
                    <span className="flex items-center gap-1.5 truncate"><MapPin size={12}/> {form.event.location}</span>
                  </div>
                </div>
              )}

              {/* Estado */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700 ml-1">
                  Estado Inicial <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-black transition-all cursor-pointer"
                >
                  {CONTRACT_STATUS.map((status) => {
                    const translations: Record<string, string> = {
                      draft: "Borrador",
                      active: "Activo",
                      cancelled: "Cancelado",
                      completed: "Completado"
                    };
                    return (
                      <option key={status} value={status}>
                        {translations[status] || status}
                      </option>
                    );
                  })}
                </select>
              </div>

            </div>

            {/* Footer Responsivo */}
            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-white sm:bg-transparent border border-gray-300 sm:border-transparent hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={createContract}
                disabled={isSubmitting || !form.eventId}
                className={`w-full sm:w-auto px-6 py-2.5 text-sm font-medium rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black flex items-center justify-center ${
                  isSubmitting || !form.eventId
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "text-white bg-gray-900 hover:bg-gray-800"
                }`}
              >
                {isSubmitting ? "Generando..." : "Crear Contrato"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}