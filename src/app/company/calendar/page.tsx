"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react";
import PageHeader from "@/app/components/crm/PageHeader";

interface Contract {
  id: number;
  status: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  client: {
    id: number;
    name: string;
  };
  event: {
    id: number;
    name: string;
    eventDate: string;
    location?: string;
  };
}

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  status: string;
  location?: string;
}

export default function GoogleLikeCalendar() {
  const router = useRouter();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/company/contracts", {
        credentials: "include",
      });

      if (!res.ok) return;
      const result = await res.json();
      setContracts(result.data);
    } catch {
      console.error("Error fetching contracts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    if (!Array.isArray(contracts) || contracts.length === 0) return;

    const mapped: CalendarEvent[] = contracts.map((contract) => ({
      id: contract.id,
      title: contract.event.name,
      date: new Date(contract.event.eventDate),
      status: contract.status,
      location: contract.event.location,
    }));

    setCalendarEvents(mapped);
  }, [contracts]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getEvents = (day: number) => {
    return calendarEvents.filter(
      (e) =>
        e.date.getDate() === day &&
        e.date.getMonth() === month &&
        e.date.getFullYear() === year,
    );
  };

  const getEventStyles = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-100";
      case "completed":
        return "bg-green-50 border-green-500 text-green-700 hover:bg-green-100";
      case "cancelled":
        return "bg-red-50 border-red-500 text-red-700 hover:bg-red-100";
      case "draft":
      default:
        return "bg-gray-50 border-gray-400 text-gray-700 hover:bg-gray-100";
    }
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleString("es-MX", { month: "long" });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">

      {/* ===================== HEADER & NAVEGACIÓN ===================== */}
      <PageHeader
        title={
          <span className="inline-block min-w-[170px] sm:min-w-[250px] capitalize">
            {capitalizedMonth} {year}
          </span>
        }
        icon={CalendarDays}
        action={
          <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            {loading && (
              <span className="text-sm font-medium text-gray-400 animate-pulse hidden sm:inline-block mr-1">
                Sincronizando...
              </span>
            )}
            
            {/* Contenedor de botones Atrás / Adelante */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden shrink-0">
              <button
                onClick={prevMonth}
                className="px-3 py-2 sm:p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none"
                title="Mes anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="w-px h-5 bg-gray-200"></div>
              <button
                onClick={nextMonth}
                className="px-3 py-2 sm:p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none"
                title="Mes siguiente"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Botón Ir a Hoy (Toma el resto del espacio en móvil con flex-1) */}
            <button
              onClick={goToToday}
              className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 shadow-sm"
            >
              Ir a Hoy
            </button>
          </div>
        }
      />

      {/* ===================== GRID DEL CALENDARIO ===================== */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">

        {/* Días de la semana */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"].map((d) => (
            <div key={d} className="text-center py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
              {d}
            </div>
          ))}
        </div>

        {/* Celdas de los días */}
        <div className="grid grid-cols-7 bg-gray-200 gap-px">
          {days.map((day, i) => (
            <div
              key={i}
              className={`min-h-[120px] bg-white p-2 transition-colors ${day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
                ? "bg-blue-50/30"
                : ""
                }`}
            >
              {day && (
                <div className="flex flex-col h-full">
                  <span className={`text-sm font-medium mb-1.5 ${day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
                    ? "bg-gray-900 text-white w-6 h-6 flex items-center justify-center rounded-full"
                    : "text-gray-500 pl-1"
                    }`}>
                    {day}
                  </span>

                  <div className="flex flex-col gap-1.5 flex-grow">
                    {getEvents(day).map((e) => (
                      <div
                        key={e.id}
                        onClick={() => router.push(`/company/contracts/${e.id}`)}
                        className={`flex flex-col gap-0.5 px-2 py-1.5 border-l-4 rounded-r-md cursor-pointer transition-all ${getEventStyles(e.status)}`}
                        title={e.title}
                      >
                        <span className="text-[11px] font-bold leading-tight line-clamp-1">
                          {e.title}
                        </span>
                        {e.location && (
                          <span className="flex items-center gap-1 text-[10px] font-medium opacity-80 line-clamp-1">
                            <MapPin size={10} className="shrink-0" />
                            {e.location}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}