"use client";

import { useEffect, useState } from "react";
import { formatTime, toLocalInput } from "@/lib/utils/date";
import { Clock, FileText, Wallet, Pencil, Trash2, X, AlertCircle } from "lucide-react";

type Props = {
  item: any;
  companyServices: any[];
  onUpdate: (id: number, data: any) => Promise<void> | void;
  onDelete: (id: number) => Promise<void> | void;
};

export default function ContractItemCard({ 
  item, 
  companyServices, 
  onUpdate, 
  onDelete 
}: Props) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [form, setForm] = useState({
    serviceId: "",
    quantity: "",
    serviceNotes: "",
    operationStart: "",
    operationEnd: "",
  });

  useEffect(() => {
    setForm({
      serviceId: String(item.service?.id || ""),
      quantity: String(item.quantity || ""),
      serviceNotes: item.serviceNotes || "",
      operationStart: toLocalInput(item.operationStart),
      operationEnd: toLocalInput(item.operationEnd),
    });
    setError("");
    setSubmitAttempted(false);
  }, [item, editing]);

  useEffect(() => {
    if (editing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editing]);

  const service = item.service;
  const subtotalView = Number(item.quantity || 0) * Number(item.unitPrice || 0);
  const subtotalEdit = Number(form.quantity || 0) * Number(item.unitPrice || 0);
  
  const realServiceData = companyServices?.find((s) => String(s.id) === String(service?.id));
  const maxStock = realServiceData?.stockTotal ?? 999;

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("es-MX", { 
      style: "currency", 
      currency: "MXN" 
    }).format(val);

  // --- BUG SOLUCIONADO: Validación natural sin autocompletar ---
  const handleQuantityChange = (val: string) => {
    // 1. Siempre actualizamos lo que el usuario escribe
    setForm({ ...form, quantity: val });

    // 2. Evaluamos para mostrar el error
    if (val === "") {
      setError("La cantidad es requerida.");
      return;
    }

    let num = Number(val);

    if (num > maxStock) {
      setError(`Solo hay ${maxStock} unidades disponibles en inventario.`);
    } else if (num < 1) {
      setError("La cantidad mínima es 1.");
    } else {
      // 3. Si todo está bien, limpiamos el error
      setError("");
    }
  };

  let startError = "";
  let endError = "";

  if (submitAttempted && !form.operationStart) {
    startError = "Por favor, ingresa la hora de inicio.";
  }
  if (submitAttempted && !form.operationEnd) {
    endError = "Por favor, ingresa la hora de fin.";
  }

  // if (form.operationStart && form.operationEnd) {
  //   if (new Date(form.operationEnd) <= new Date(form.operationStart)) {
  //     endError = "La hora de fin debe ser posterior al inicio.";
  //   }
  // }

  const isInvalid = !!error || !form.quantity || !form.operationStart || !form.operationEnd;

  return (
    <>
      {/* ---------------- MODO LECTURA ---------------- */}
      <div className="group flex items-center justify-between p-3 md:p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all mb-2">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">
            {service?.name}
          </span>
          <span className="text-xs font-medium text-gray-500 mt-0.5">
            {item.quantity} unidades <span className="mx-1">•</span> {formatMoney(item.unitPrice)} c/u
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-black text-gray-900">
            {formatMoney(subtotalView)}
          </span>
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setEditing(true)} 
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
              title="Editar"
            >
              <Pencil size={16} />
            </button>
            <button 
              onClick={() => onDelete(item.id)} 
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- MODO EDICIÓN (MODAL) ---------------- */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-none">
                  {service?.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1.5">
                  Editando detalles del servicio asignado
                </p>
              </div>
              <button 
                onClick={() => setEditing(false)} 
                className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-5">
              
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-semibold text-gray-700">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className={`w-full md:w-1/3 px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-1 transition-all ${
                    error ? "border-red-500 focus:ring-red-500 bg-red-50/30" : "border-gray-300 focus:ring-black"
                  }`}
                />
                {error && (
                  <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1 animate-pulse">
                    <AlertCircle size={14} /> {error}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Clock size={12} /> Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={form.operationStart || ""}
                    onChange={(e) => setForm({ ...form, operationStart: e.target.value })}
                    className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-1 transition-all ${
                      startError ? "border-red-500 focus:ring-red-500 bg-red-50/30" : "border-gray-300 focus:ring-black"
                    }`}
                  />
                  {startError && (
                    <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1 animate-pulse">
                      <AlertCircle size={14} /> {startError}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Clock size={12} /> Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={form.operationEnd || ""}
                    onChange={(e) => setForm({ ...form, operationEnd: e.target.value })}
                    className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-1 transition-all ${
                      endError ? "border-red-500 focus:ring-red-500 bg-red-50/30" : "border-gray-300 focus:ring-black"
                    }`}
                  />
                  {endError && (
                    <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1 animate-pulse">
                      <AlertCircle size={14} /> {endError}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <FileText size={12} /> Notas Adicionales
                </label>
                <textarea
                  value={form.serviceNotes}
                  onChange={(e) => setForm({ ...form, serviceNotes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black resize-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-5 border-t border-gray-100">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                  <Wallet size={14} /> Nuevo Subtotal
                </span>
                <span className="text-xl font-black text-gray-900">
                  {formatMoney(subtotalEdit)}
                </span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setEditing(false)} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                >
                  Cancelar
                </button>
                <button
                  disabled={isInvalid}
                  onClick={() => {
                    setSubmitAttempted(true);

                    if (!form.operationStart || !form.operationEnd || startError || endError || error || !form.quantity) {
                      return; 
                    }

                    const safeStart = form.operationStart ? new Date(form.operationStart).toISOString() : undefined;
                    const safeEnd = form.operationEnd ? new Date(form.operationEnd).toISOString() : undefined;
                    
                    onUpdate(item.id, { 
                      quantity: Number(form.quantity), 
                      serviceNotes: form.serviceNotes, 
                      operationStart: safeStart, 
                      operationEnd: safeEnd 
                    });
                    
                    setEditing(false);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm ${
                    isInvalid ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}