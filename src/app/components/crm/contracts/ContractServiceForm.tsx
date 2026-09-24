"use client";

import { useMemo, useState } from "react";
import { formatDate } from "@/lib/utils/date";
import { Plus, PackageSearch, X, AlertCircle } from "lucide-react";

type Props = {
  companyServices: any[];
  contract: any;
  onSubmit: (data: any) => Promise<boolean | void>;
};

const initialForm = {
  serviceId: "",
  quantity: "",
  unitPrice: "",
  serviceNotes: "",
  operationStart: "",
  operationEnd: "",
};

export default function ContractServiceForm({
  companyServices,
  contract,
  onSubmit,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const selectedService = useMemo(() => {
    return companyServices.find((s) => String(s.id) === form.serviceId);
  }, [companyServices, form.serviceId]);

  const maxStock = selectedService?.stockTotal ?? 999;

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = e.target.value;
    const service = companyServices.find((s) => String(s.id) === serviceId);
    
    if (!service) {
      setForm({ ...form, serviceId: "" });
      return;
    }

    setForm((prev) => ({
      ...prev,
      serviceId,
      unitPrice: String(service.priceBase),
      quantity: "", 
    }));
    setError("");
    setSubmitAttempted(false);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, quantity: val }));

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
      setError("");
    }
  };

  let startError = "";
  let endError = "";

  if (submitAttempted && !form.operationStart) {
    startError = "Hora de inicio requerida.";
  }
  if (submitAttempted && !form.operationEnd) {
    endError = "Hora de fin requerida.";
  }

  // if (form.operationStart && form.operationEnd) {
  //   const eventDate = contract?.event?.eventDate?.split("T")[0] || "2000-01-01";
  //   const start = new Date(`${eventDate}T${form.operationStart}`);
  //   const end = new Date(`${eventDate}T${form.operationEnd}`);
    
  //   if (end <= start) {
  //     endError = "El fin debe ser posterior al inicio.";
  //   }
  // }

  const subtotal = Number(form.quantity || 0) * Number(form.unitPrice || 0);
  
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-MX", { 
      style: "currency", 
      currency: "MXN" 
    }).format(amount);
  };

  async function handleSubmit() {
    setSubmitAttempted(true); 

    if (!form.serviceId || !form.operationStart || !form.operationEnd || startError || endError || error || !form.quantity) {
      return; 
    }

    const success = await onSubmit(form);
    if (!success) return;
    
    setShowForm(false);
    setForm(initialForm);
    setError("");
    setSubmitAttempted(false);
  }

  function handleCancel() {
    setShowForm(false);
    setForm(initialForm);
    setError("");
    setSubmitAttempted(false);
  }

  return (
    <div className="w-full mb-8">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex flex-col items-center justify-center gap-2 py-8 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
        >
          <div className="bg-white p-2 rounded-full shadow-sm border border-gray-200">
            <Plus size={20} className="text-gray-900" />
          </div>
          <span className="font-semibold text-sm">Añadir Nuevo Servicio</span>
        </button>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">
              Configurar Servicio
            </h3>
            <button 
              onClick={handleCancel} 
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          {/* GRID RESPONSIVO: 1 columna en móvil, 2 en pantallas medianas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* SERVICIO (Ocupa todo el ancho) */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700 ml-1">Servicio / Equipo <span className="text-red-500">*</span></label>
              <select
                value={form.serviceId}
                onChange={handleServiceChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
              >
                <option value="" disabled>Selecciona un servicio...</option>
                {companyServices.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name} ({formatMoney(s.priceBase)})
                  </option>
                ))}
              </select>
            </div>

            {/* CANTIDAD */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700 ml-1">Cantidad <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={form.quantity}
                onChange={handleQuantityChange}
                placeholder="Ej. 1"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
              {error && (
                <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-0.5 animate-pulse">
                  <AlertCircle size={14} /> {error}
                </span>
              )}
            </div>

            {/* PRECIO UNITARIO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700 ml-1">Precio Unitario <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            {/* HORA DE INICIO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700 ml-1">Inicio (Montaje) <span className="text-red-500">*</span></label>
              <input
                type="time"
                value={form.operationStart}
                onChange={(e) => setForm({ ...form, operationStart: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
              {startError && (
                <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-0.5 animate-pulse">
                  <AlertCircle size={14} /> {startError}
                </span>
              )}
            </div>

            {/* HORA DE FIN */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700 ml-1">Fin (Desmontaje) <span className="text-red-500">*</span></label>
              <input
                type="time"
                value={form.operationEnd}
                onChange={(e) => setForm({ ...form, operationEnd: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
              {endError && (
                <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-0.5 animate-pulse">
                  <AlertCircle size={14} /> {endError}
                </span>
              )}
            </div>

            {/* NOTAS (Ocupa todo el ancho) */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700 ml-1">Notas Adicionales</label>
              <textarea
                rows={2}
                value={form.serviceNotes}
                onChange={(e) => setForm({ ...form, serviceNotes: e.target.value })}
                placeholder="Instrucciones especiales..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all resize-y"
              />
            </div>
          </div>

          {/* CAJA DE INVENTARIO Y SUBTOTAL (Minimalista Neutro) */}
          {selectedService && (
            <div className="mt-5 bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <PackageSearch size={16} className="text-gray-500"/> 
                  Disponibilidad en Inventario
                </div>
                <div className="text-xs text-gray-500">
                  Fecha del evento: {formatDate(contract?.event?.eventDate)}
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  Unidades totales base: <strong>{selectedService.stockTotal}</strong>
                </div>
              </div>

              {subtotal > 0 && (
                <div className="bg-white px-4 py-2.5 rounded-lg border border-gray-200 text-right shadow-sm shrink-0">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Subtotal Estimado
                  </div>
                  <div className="text-lg font-black text-gray-900">
                    {formatMoney(subtotal)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BOTONES RESPONSIVOS (Col-reverse en móvil, Row en desktop) */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
            <button
              onClick={handleCancel}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Agregar al Contrato
            </button>
          </div>

        </div>
      )}
    </div>
  );
}