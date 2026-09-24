"use client";

import { formatDate } from "@/lib/utils/date";
import { Receipt, Trash2, CreditCard } from "lucide-react";

type Props = {
  payments: any[];
  onDeleteSuccess?: () => void;
};

export default function PaymentList({ payments, onDeleteSuccess }: Props) {
  
  async function handleDelete(id: number) {
    if (!confirm("¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer.")) return;

    try {
      const res = await fetch(`/api/company/payments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        alert("Error al eliminar el pago.");
        return;
      }

      onDeleteSuccess?.();
    } catch {
      alert("Error de conexión con el servidor.");
    }
  }

  const formatMoney = (amount: number | string) => {
    return new Intl.NumberFormat("es-MX", { 
      style: "currency", 
      currency: "MXN" 
    }).format(Number(amount));
  };

  // ===================== ESTADO VACÍO =====================
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Receipt size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Sin historial de pagos</h3>
        <p className="text-sm text-gray-500">Aún no se han registrado pagos que coincidan con tu búsqueda.</p>
      </div>
    );
  }

  // ===================== GRID DE PAGOS =====================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-2">
      {payments.map((payment) => (
        <div 
          key={payment.id} 
          className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col"
        >
          {/* 1. Cabecera del Pago: ID, Fecha y Total */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                Pago #{payment.id}
              </h3>
              <span className="text-xs text-gray-500 mt-0.5">
                {payment.paidAt ? formatDate(payment.paidAt) : formatDate(payment.createdAt)}
              </span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-xl font-black text-gray-900">
                {formatMoney(payment.amount)}
              </span>
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-1">
                <CreditCard size={12} />
                {payment.paymentMethod} · {payment.currency}
              </span>
            </div>
          </div>

          {/* 2. Cuerpo: Ticket y Conceptos */}
          <div className="flex flex-col gap-3 flex-grow">
            
            {/* Etiqueta del Ticket */}
            {payment.ticketNumber && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg w-fit border border-gray-200">
                <Receipt size={14} className="text-gray-500" />
                Ticket Ref: {payment.ticketNumber}
              </div>
            )}

            {/* Lista de Items (Estilo Factura) */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex flex-col gap-2">
              <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Conceptos Pagados</h4>
              
              {payment.items.map((item: any) => (
                <div
                  key={`p${payment.id}-c${payment.contractId}-i${item.contractItemId}`}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex flex-col pr-4">
                    <span className="font-medium text-gray-800 line-clamp-1">
                      {item.service.name}
                    </span>
                    {item.service.description && (
                      <span className="text-xs text-gray-500 line-clamp-1">
                        {item.service.description}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900 shrink-0">
                    {formatMoney(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Acciones (Eliminar) */}
          <div className="flex justify-end mt-4 pt-3 border-t border-gray-50">
            <button
              onClick={(e) => {
                e.preventDefault(); 
                handleDelete(payment.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
            >
              <Trash2 size={14} />
              Eliminar Registro
            </button>
          </div>

        </div>
      ))}
    </div>
  );
}