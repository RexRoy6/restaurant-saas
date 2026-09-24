"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  CreditCard, 
  Briefcase, 
  RefreshCcw,
  FileText
} from "lucide-react";
import ErrorBox from "@/app/components/ErrorBox";
import DetailCard from "@/app/components/crm/DetailCard";
import {
  formatDate,
  formatTime,
  replaceDateKeepTime,
} from "@/lib/utils/date";

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.contractId;

  const [contract, setContract] = useState<any>(null);
  const [form, setForm] = useState({
    status: "",
    totalAmount: "",
    eventDate: "",
    eventStart: "",
    eventEnd: "",
    eventLocation: "",
    eventNote: "",
  });

  const [eventId, setEventId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  // Traducción y limpieza (sin emojis)
  const contractFields = [
    { name: "status", label: "Estado del Contrato" },
    { name: "totalAmount", label: "Monto Total", type: "number" },
    { name: "paidAmount", label: "Monto Pagado", readOnly: true },
    { name: "remainingAmount", label: "Saldo Restante", readOnly: true },
    { name: "clientName", label: "Cliente Vinculado", readOnly: true },
    { name: "eventName", label: "Evento Vinculado", readOnly: true },
    { name: "eventDate", label: "Fecha del Evento", type: "date", readOnly: false },
    { name: "eventLocation", label: "Ubicación del Evento", readOnly: false },
    { name: "eventNote", label: "Notas del Evento", type: "textarea", readOnly: false },
  ];

  /* ---------- FETCH ---------- */
  const fetchContract = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/company/contracts/${contractId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        setError("Error al cargar los detalles del contrato.");
        setErrorCode(res.status);
        return;
      }

      const data = await res.json();
      setContract(data);
      setEventId(data.event?.id ?? null);

      setForm({
        status: data.status ?? "",
        totalAmount: data.totalAmount ?? 0,
        eventDate: data.event?.eventDate
          ? data.event.eventDate.slice(0, 10)
          : "",
        eventStart: data.event?.eventStart ?? "",
        eventEnd: data.event?.eventEnd ?? "",
        eventLocation: data.event?.location ?? "",
        eventNote: data.event?.notes ?? "",
      });
    } catch {
      setError("Error de conexión al cargar el contrato.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UPDATE ---------- */
  const updateContract = async () => {
    try {
      setSaving(true);
      setError("");

      /* UPDATE CONTRACT */
      const contractRes = await fetch(
        `/api/company/contracts/${contractId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: form.status,
            totalAmount: Number(form.totalAmount),
          }),
        }
      );

      if (!contractRes.ok) {
        const data = await contractRes.json();
        if (data?.error?.fieldErrors) {
          const messages = Object.values(data.error.fieldErrors)
            .flat()
            .join(", ");
          setError(messages);
        } else {
          setError("Error al actualizar el contrato.");
        }
        return;
      }

      /* UPDATE EVENT */
      if (eventId) {
        const eventRes = await fetch(
          `/api/company/events/${eventId}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventDate: replaceDateKeepTime(form.eventDate, form.eventStart),
              eventStart: replaceDateKeepTime(form.eventDate, form.eventStart),
              eventEnd: replaceDateKeepTime(form.eventDate, form.eventEnd),
              location: form.eventLocation,
              notes: form.eventNote,
            }),
          }
        );

        if (!eventRes.ok) {
          setError("Error al actualizar los datos del evento.");
          return;
        }
      }

      await fetchContract();
      setEditing(false);
    } catch {
      setError("Error de conexión al actualizar.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- DELETE ---------- */
  const deleteContract = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este contrato?")) return;

    try {
      const res = await fetch(`/api/company/contracts/${contractId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        setError("Error al eliminar el contrato.");
        return;
      }

      router.push("/company/contracts");
    } catch {
      setError("Error de conexión al eliminar.");
    }
  };

  /* ---------- REACTIVATE ---------- */
  const reactivateContract = async () => {
    try {
      const res = await fetch(
        `/api/company/contracts/${contractId}?reactivate=true`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (!res.ok) {
        setError("Error al reactivar el contrato.");
        return;
      }

      await fetchContract();
    } catch {
      setError("Error de conexión al reactivar.");
    }
  };

  useEffect(() => {
    fetchContract();
  }, []);

  const formatMoney = (value: number = 0) =>
    `$${value.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
    })}`;

  const formattedContract = contract
    ? {
        ...contract,
        totalAmount: formatMoney(contract.totalAmount),
        paidAmount: formatMoney(contract.paidAmount),
        remainingAmount: formatMoney(contract.remainingAmount),
        clientName: contract.client?.name || "Sin cliente",
        eventName: contract.event?.name || "Sin evento",
        eventDate: formatDate(contract.event?.eventDate),
        eventTime: formatTime(contract.event?.eventDate),
        eventLocation: contract.event?.location,
        eventNote: contract.event?.notes,
      }
    : null;

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-10">
      
      {/* 1. NAVEGACIÓN Y CABECERA */}
      <div className="flex items-start gap-3">
        <Link
          href="/company/contracts"
          className="p-2 -ml-2 mt-0.5 text-gray-400 hover:text-gray-900 bg-transparent hover:bg-gray-100 rounded-full transition-colors focus:outline-none shrink-0"
          title="Volver a los contratos"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex flex-col gap-2.5">
          <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight m-0 leading-none mt-1">
            <FileText size={28} className="text-gray-400 hidden sm:block" />
            Detalles del Contrato
            {contract && <span className="text-gray-400 font-medium">#{contract.id}</span>}
          </h1>
          
          {/* BADGES INTERACTIVOS: CLIENTE Y EVENTO */}
          {contract && (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {contract.client && (
                <Link 
                  href={`/company/clients/${contract.client.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-xs font-semibold uppercase tracking-wider rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <User size={14} className="text-gray-400" />
                  {contract.client.name}
                </Link>
              )}
              {contract.event && (
                <Link 
                  href={`/company/clients/${contract.client?.id || 'all'}/events/${contract.event.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-xs font-semibold uppercase tracking-wider rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <Calendar size={14} className="text-gray-400" />
                  {contract.event.name}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <ErrorBox message={error} code={errorCode} />}

      {/* 2. SKELETON LOADER */}
      {loading && (
        <div className="animate-pulse flex flex-col gap-6 w-full max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm w-full flex flex-col gap-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="flex flex-col gap-0 bg-gray-50 rounded-xl border border-gray-100 p-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-14 border-b border-gray-100 last:border-0"></div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
               <div className="h-10 bg-gray-200 rounded w-32"></div>
               <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTENIDO PRINCIPAL */}
      {!loading && contract && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full max-w-2xl mx-auto">
          <DetailCard
            title="Información General"
            fields={contractFields}
            data={formattedContract}
            form={form}
            setForm={setForm}
            editing={editing}
            setEditing={setEditing}
            saving={saving}
            onSave={updateContract}
            onDelete={deleteContract}
            actions={[
              {
                label: "Servicios",
                href: `/company/contracts/${contractId}/services`,
                icon: Briefcase,
              },
              {
                label: "Pagos",
                href: `/company/contracts/${contractId}/payments`,
                icon: CreditCard,
                variant: "primary", 
              },
              ...(contract.deletedAt
                ? [
                    {
                      label: "Reactivar",
                      onClick: reactivateContract,
                      icon: RefreshCcw,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      )}
    </div>
  );
}