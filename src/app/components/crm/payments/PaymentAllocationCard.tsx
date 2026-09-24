"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

type Item = {
  id: number;
  quantity: number;
  unitPrice: number | string;
  paidAmount?: number;
  remainingAmount?: number;
  service: {
    name: string;
    description?: string;
  };
};

type Props = {
  items: Item[];
  formItems: {
    contractItemId: number;
    amount: number | string;
  }[];
  setForm: (fn: (prev: any) => any) => void;
};

export default function PaymentAllocationCard({
  items,
  formItems,
  setForm,
}: Props) {
  
  const formatMoney = (val: number) => 
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(val);

  const handleSetAmount = (index: number, itemId: number, amount: number | string) => {
    setForm((prev: any) => {
      const updated = [...prev.items];
      updated[index] = { 
        ...updated[index], 
        contractItemId: itemId,
        amount: amount === "" ? "" : Number(amount) 
      };
      return { ...prev, items: updated };
    });
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-4 sm:p-6 border border-gray-200 rounded-2xl shadow-sm">
      
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h4 className="text-base font-bold text-gray-900 tracking-tight">Desglose de Conceptos</h4>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
          {items.length} {items.length === 1 ? 'Partida' : 'Partidas'}
        </span>
      </div>
      
      {/* Lista de Conceptos */}
      <div className="flex flex-col gap-3">
        {items.map((item, index) => {
          const total = item.quantity * Number(item.unitPrice);
          const paid = item.paidAmount || 0;
          const remaining = item.remainingAmount ?? (total - paid);
          
          const currentItemForm = formItems[index];
          const rawValue = currentItemForm?.amount;
          const valueStr = rawValue === undefined || rawValue === null || rawValue === "" ? "" : String(rawValue);
          const numValue = Number(rawValue || 0);

          // --- VALIDACIONES ---
          let errorMsg = "";
          if (numValue > remaining) {
            errorMsg = `Supera el saldo restante (${formatMoney(remaining)})`;
          } else if (numValue < 0) {
            errorMsg = "El abono no puede ser negativo.";
          }

          const isFullyPaid = remaining <= 0;

          return (
            <div 
              key={item.id} 
              className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${
                isFullyPaid ? "bg-green-50/30 border-green-100" : "bg-gray-50/50 border-gray-200 hover:border-gray-300"
              }`}
            >
              
              {/* Información del Concepto */}
              <div className="flex flex-col gap-1.5 flex-grow">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900 line-clamp-1">{item.service.name}</span>
                  {isFullyPaid && (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-sm tracking-wider">
                      <CheckCircle2 size={10} /> Pagado
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{item.quantity} × {formatMoney(Number(item.unitPrice))}</span>
                  <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                  <span>Total: <strong className="text-gray-700">{formatMoney(total)}</strong></span>
                </div>
                
                {paid > 0 && !isFullyPaid && (
                  <span className="text-xs font-semibold text-blue-700 mt-0.5 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md w-fit">
                    Abonado previamente: {formatMoney(paid)}
                  </span>
                )}
              </div>

              {/* Input y Restante */}
              {!isFullyPaid ? (
                <div className="flex flex-col items-end gap-1.5 shrink-0 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-gray-200">
                  <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <div className="flex flex-col text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Saldo actual</span>
                      <span className="text-sm font-bold text-gray-900">{formatMoney(remaining)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">$</span>
                        <input
                          type="number"
                          value={valueStr}
                          max={remaining}
                          min={0}
                          placeholder="0.00"
                          className={`w-28 pl-7 pr-3 py-2 text-sm font-bold bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                            errorMsg 
                              ? "border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50/30 text-red-700" 
                              : "border-gray-300 focus:ring-gray-200 focus:border-black text-gray-900"
                          }`}
                          onChange={(e) => handleSetAmount(index, item.id, e.target.value)}
                        />
                      </div>
                      
                      {/* Botón UX Magic: Liquidar (MAX) */}
                      <button
                        type="button"
                        onClick={() => handleSetAmount(index, item.id, remaining)}
                        className="px-2.5 py-2 text-[11px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        title="Liquidar saldo restante"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                  
                  {errorMsg && (
                    <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-0.5 animate-pulse">
                      <AlertCircle size={12} /> {errorMsg}
                    </span>
                  )}
                </div>
              ) : (
                <div className="shrink-0 flex items-center text-sm font-bold text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-100 mt-2 md:mt-0">
                  Saldo en Ceros
                </div>
              )}
              
            </div>
          );
        })}
      </div>

      {/* Footer / Gran Total */}
      <div className="flex justify-between items-center mt-2 pt-4 border-t-2 border-gray-100">
        <div className="flex flex-col">
          <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Total a Abonar</span>
          <span className="text-[10px] text-gray-400">En esta transacción</span>
        </div>
        <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {formatMoney(formItems.reduce((sum, i) => sum + (Number(i?.amount) || 0), 0))}
        </span>
      </div>
    </div>
  );
}