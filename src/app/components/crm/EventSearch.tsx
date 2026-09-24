"use client";

import { useEffect, useState, useRef } from "react";
import { Search, User, MapPin } from "lucide-react";

export default function EventSearch({ onSelect }: { onSelect: (event: any) => void }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ------------------------------------------------------------------
  // 🚀 MAGIA UX: Cierre del menú al hacer clic fuera del componente
  // ------------------------------------------------------------------
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!search.trim()) {
        setResults([]);
        setIsOpen(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/company/events?search=${search}&limit=5`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("Error fetching");

        const data = await res.json();
        setResults(data.data);
        setIsOpen(true);
      } catch (error) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      
      {/* Input de Búsqueda */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Buscar evento por nombre o cliente..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0 || search.trim() !== "") setIsOpen(true);
          }}
          className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-black transition-all shadow-sm"
        />
        {isSearching && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider animate-pulse">
            Buscando...
          </span>
        )}
      </div>

      {/* Menú Flotante de Resultados */}
      {isOpen && search.trim() !== "" && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          {results.length > 0 ? (
            <div className="flex flex-col py-1">
              {results.map((event) => (
                <div
                  key={event.id}
                  onClick={() => {
                    onSelect(event);
                    setSearch("");
                    setResults([]);
                    setIsOpen(false);
                  }}
                  className="flex flex-col px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                >
                  <span className="text-sm font-bold text-gray-900 truncate">
                    {event.name}
                  </span>
                  
                  <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-gray-500">
                    <span className="flex items-center gap-1.5 truncate">
                      <User size={12} className="shrink-0 text-gray-400" />
                      {event.client?.name || "Sin cliente"}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1.5 truncate">
                        <MapPin size={12} className="shrink-0 text-gray-400" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isSearching && (
              <div className="px-4 py-8 text-center flex flex-col items-center justify-center gap-2">
                <Search size={24} className="text-gray-300" />
                <p className="text-sm font-medium text-gray-500">
                  No se encontraron eventos para "{search}"
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}