"use client";

import type { Client } from "@/types/client";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, ArrowRight, Trash2 } from "lucide-react";

export default function ClientList({
  clients,
  onDelete,
}: {
  clients: Client[];
  onDelete?: (id: number) => void;
}) {
  const router = useRouter();

  // El estado vacío ya lo maneja ClientsModule, pero por si acaso dejamos una salvaguarda
  if (clients.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {clients.map((client) => (
        <div 
          key={client.id} 
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between group"
        >
          {/* Cabecera de la Tarjeta */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 text-gray-500">
              <User size={20} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-gray-900 truncate" title={client.name}>
                {client.name}
              </span>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="flex flex-col gap-3 mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-2.5">
              <Phone size={15} className="text-gray-400 shrink-0" />
              <span>{client.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail size={15} className="text-gray-400 shrink-0" />
              {/* Cambiamos client.email por client.email || "" */}
              <span className="truncate" title={client.email || ""}>
                {client.email || "—"}
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-auto">
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(client.id);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                title="Eliminar cliente"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={() => router.push(`/company/clients/${client.id}`)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200"
            >
              Administrar
              <ArrowRight size={14} />
            </button>
          </div>
          
        </div>
      ))}
    </div>
  );
}