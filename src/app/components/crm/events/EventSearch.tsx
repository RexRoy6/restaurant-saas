"use client";

import { useEffect, useState } from "react";
import { User, Calendar, MapPin, Search, Loader2 } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils/date";

export default function EventSearch({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect: (event: any) => void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!search.trim()) {
        setResults([]);
        return;
      }
      fetchEvents();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/company/events?search=${encodeURIComponent(search)}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        setResults([]);
        return;
      }
      const data = await res.json();
      setResults(data.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* INPUT */}
      {!selected && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar evento por nombre o cliente..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all shadow-sm"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
          )}
        </div>
      )}

      {/* RESULTADOS (Dropdown) */}
      {!selected && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {results.map((event) => (
            <div
              key={event.id}
              onClick={() => {
                onSelect(event);
                setResults([]);
                setSearch("");
              }}
              className="flex flex-col gap-1 p-3 cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold text-sm text-gray-900">
                {event.name}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <User size={12} /> {event.client?.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {formatDate(event.eventDate)}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {event.location}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}