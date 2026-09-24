"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, User, Phone } from "lucide-react";

export default function ClientSearch({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (client: any) => void;
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
      fetchClients();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const fetchClients = async () => {
    try {
      setLoading(true);

      // Usamos encodeURIComponent por seguridad en la URL
      const res = await fetch(`/api/company/clients?search=${encodeURIComponent(search)}`, {
        credentials: "include",
      });

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
      {/* INPUT DE BÚSQUEDA */}
      {!selected && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente por nombre..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all shadow-sm"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
          )}
        </div>
      )}

      {/* RESULTADOS (Dropdown flotante) */}
      {!selected && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {results.map((client) => (
            <div
              key={client.id}
              onClick={() => {
                onSelect(client);
                setResults([]);
                setSearch("");
              }}
              className="flex flex-col gap-1 p-3 cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <User size={14} className="text-gray-400" />
                {client.name}
              </div>
              
              {client.phone && (
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5 pl-5">
                  <Phone size={12} className="text-gray-400" />
                  {client.phone}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}