"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  X, 
  Clock, 
  CalendarDays,
  AlignLeft
} from "lucide-react";
import ErrorBox from "@/app/components/ErrorBox";
import { formatDate, formatTime } from "@/lib/utils/date";

export default function ClientEventsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = Array.isArray(params.clientId) ? params.clientId[0] : params.clientId;

  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number>();
  const [loading, setLoading] = useState(true);

  // Estados del Modal de Creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    eventDate: "",
    location: "",
    notes: "",
  });

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/company/events?clientId=${clientId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setError("Error al cargar los eventos.");
        setErrorCode(res.status);
        return;
      }

      const result = await res.json();
      setEvents(result.data);
    } catch {
      setError("Error de conexión al cargar eventos.");
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    if (!form.name || !form.eventDate) {
      setError("El nombre y la fecha son obligatorios.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...form,
        clientId: Number(clientId),
      };

      const res = await fetch("/api/company/events", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setError("Error al crear el evento.");
        setErrorCode(res.status);
        setIsSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      setForm({ name: "", eventDate: "", location: "", notes: "" });
      setError("");
      fetchEvents();
    } catch {
      setError("Error de conexión al crear evento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      
      {/* ===================== NAVEGACIÓN Y HEADER ===================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <Link
            href={`/company/clients/${clientId}`}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 bg-transparent hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
            title="Volver al perfil del cliente"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight m-0">
            Eventos del Cliente
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black shrink-0"
        >
          <Plus size={18} />
          Nuevo Evento
        </button>
      </div>

      {error && <ErrorBox message={error} code={errorCode} />}

      {/* ===================== ESTADO DE CARGA ===================== */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl border border-gray-200 animate-pulse"></div>
          ))}
        </div>
      )}

      {/* ===================== ESTADO VACÍO ===================== */}
      {!loading && events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <CalendarDays size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No hay eventos registrados</h3>
          <p className="text-sm text-gray-500 mb-6">Este cliente aún no tiene ningún evento programado.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
          >
            <Plus size={18} />
            Crear Primer Evento
          </button>
        </div>
      )}

      {/* ===================== GRID DE EVENTOS ===================== */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between group"
            >
              <div className="flex flex-col mb-5">
                <h3 className="font-bold text-gray-900 text-lg truncate" title={event.name}>
                  {event.name || "Evento sin nombre"}
                </h3>
              </div>

              <div className="flex flex-col gap-3 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-2.5">
                  <Calendar size={16} className="text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-700">{formatDate(event.eventDate)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock size={16} className="text-gray-400 shrink-0" />
                  <span>{formatTime(event.eventDate)}</span>
                </div>
                {event.location && (
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{event.location}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 mt-auto flex justify-end">
                <Link
                  href={`/company/clients/${clientId}/events/${event.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200"
                >
                  Ver Detalles
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================== MODAL DE CREACIÓN INLINE ===================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Registrar Nuevo Evento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors focus:outline-none">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700 ml-1">
                  Nombre del Evento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Boda Civil"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700 ml-1">
                  Fecha y Hora <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local" // Usamos datetime-local para que elijan fecha y hora a la vez
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700 ml-1">Ubicación</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ej. Salón Jardín Real"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700 ml-1">Notas Adicionales</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <AlignLeft size={16} className="text-gray-400" />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Detalles extra del evento..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all resize-y"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none"
              >
                Cancelar
              </button>
              <button
                onClick={createEvent}
                disabled={isSubmitting}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                  isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "text-white bg-gray-900 hover:bg-gray-800"
                }`}
              >
                {isSubmitting ? "Creando..." : "Crear Evento"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}