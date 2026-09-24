"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, FileText, DollarSign } from "lucide-react";

export default function ContractSearch({ onSelect, selected }: any) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (selected) return null;
      if (!search.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(
          `/api/company/contracts?search=${encodeURIComponent(search)}&limit=5`,
          { credentials: "include" }
        );
        if (!res.ok) return;
        
        const data = await res.json();
        // Solo contratos con saldo pendiente
        const filtered = data.data.filter((c: any) => c.remainingAmount > 0);
        setResults(filtered);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const formatMoney = (val: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(val);

  return (
    <div className="relative w-full">
      {!selected && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar contrato por ID o cliente..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all shadow-sm"
          />
          {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />}
        </div>
      )}

      {!selected && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {results.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                onSelect(c);
                setSearch("");
                setResults([]);
              }}
              className="flex flex-col gap-1 p-3 cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold text-sm text-gray-900 flex items-center justify-between">
                <span>Contrato #{c.id} · {c.client?.name}</span>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center gap-0.5">
                  <DollarSign size={12}/> Pendiente
                </span>
              </div>

              <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                <FileText size={12} className="text-gray-400" />
                {c.event?.name}
              </div>

              <div className="text-sm font-medium text-gray-900 mt-1 pl-4">
                Saldo: {formatMoney(c.remainingAmount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}