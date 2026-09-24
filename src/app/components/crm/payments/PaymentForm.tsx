"use client";

import { useEffect, useState, useRef } from "react";
import PaymentAllocationCard from "@/app/components/crm/payments/PaymentAllocationCard";
import ErrorBox from "@/app/components/ErrorBox";
import ContractSearch from "@/app/components/crm/ContractSearch";
import { Plus, AlertCircle, X } from "lucide-react";
import { useContractItems } from "@/app/hooks/useContractItems";
import { parseLocalDate } from "@/lib/utils/date";

export default function PaymentForm({
  contractId,
  onSuccess,
}: {
  contractId?: string;
  onSuccess?: () => void;
}) {
  const isGlobal = !contractId;
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const activeContractId = contractId || selectedContractId;

  const { contractItems, fetchContractItems } = useContractItems(activeContractId);
  const [show, setShow] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    currency: "MXN",
    paymentMethod: "cash",
    paidAt: "",
    ticketNumber: "",
    items: [] as {
      contractItemId: number;
      amount: number;
    }[],
  });

  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const modalRef = useRef<HTMLDivElement>(null);

  // ------------------------------------------------------------------
  // 🚀 MAGIA UX: Scroll Lock + Cierre al clic exterior (Estándar CRM)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeForm();
      }
    };

    if (show) document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [show]);

  /* ---------- Validaciones Locales ---------- */
  let dateError = "";
  if (submitAttempted) {
    if (!form.paidAt) {
      dateError = "La fecha de pago es obligatoria.";
    } else {
      const selectedDate = new Date(form.paidAt);
      const today = new Date();
      if (selectedDate > today) {
        dateError = "La fecha de pago no puede ser en el futuro.";
      }
    }
  }

  const hasExceededAmounts = contractItems.some((item, idx) => {
    const total = item.quantity * Number(item.unitPrice);
    const paid = item.paidAmount || 0;
    const remaining = item.remainingAmount ?? total - paid;
    const val = form.items[idx]?.amount || 0;
    return val > remaining || val < 0;
  });

  const renderFieldError = (fieldName: string) => {
    if (!fieldErrors[fieldName] || fieldErrors[fieldName].length === 0) return null;
    return (
      <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-0.5 animate-pulse ml-1">
        <AlertCircle size={12} /> {fieldErrors[fieldName].join(", ")}
      </span>
    );
  };

  /* ---------- Ciclo de Vida ---------- */
  useEffect(() => {
    if (activeContractId) {
      fetchContractItems().then((items) => {
        if (items) {
          setForm((prev) => ({
            ...prev,
            items: items.map((i: any) => ({ contractItemId: i.id, amount: "" })),
          }));
        }
      });
    }
  }, [activeContractId]); 

  /* ---------- Acciones ---------- */
  async function openForm() {
    setShow(true);
    if (contractId) {
      const items = await fetchContractItems();
      setForm((prev) => ({
        ...prev,
        items: items.map((i: any) => ({ contractItemId: i.id, amount: 0 })),
      }));
    }
  }

  function closeForm() {
    setShow(false);
    setForm({
      currency: "MXN",
      paymentMethod: "cash",
      paidAt: "",
      ticketNumber: "",
      items: [],
    });
    setSelectedContractId("");
    setError("");
    setFieldErrors({});
    setSubmitAttempted(false);
    setIsSubmitting(false);
  }

  async function handleSubmit() {
    setSubmitAttempted(true);
    setError("");
    setFieldErrors({});

    if (!activeContractId) {
      setError("Por favor, selecciona un contrato.");
      return;
    }

    if (!form.paidAt || dateError) return; 

    const total = form.items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    if (total <= 0) {
      setError("Debes ingresar al menos un monto de abono mayor a cero en el desglose.");
      return;
    }

    if (hasExceededAmounts) {
      setError("Por favor corrige los montos en rojo que superan el saldo restante.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        currency: form.currency,
        paymentMethod: form.paymentMethod,
        paidAt: form.paidAt ? parseLocalDate(form.paidAt).toISOString() : undefined,
        ticketNumber: form.ticketNumber || undefined,
        items: form.items.filter((i) => Number(i.amount) > 0),
      };

      const res = await fetch(`/api/company/contracts/${activeContractId}/payments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
          setError("Revisa los campos marcados en rojo, los datos enviados no son válidos.");
        } else {
          setError(typeof data.error === "string" ? data.error : "Error al registrar el pago.");
        }
        setErrorCode(res.status);
        setIsSubmitting(false);
        return;
      }

      closeForm();
      onSuccess?.();
    } catch {
      setError("Error de conexión con el servidor.");
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={openForm}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black shrink-0"
      >
        <Plus size={18} />
        Registrar Pago
      </button>

      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Registrar Pago</h3>
              <button 
                onClick={closeForm} 
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 flex flex-col gap-5 sm:gap-6">
              
              {/* Alertas Generales */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600 font-semibold animate-in slide-in-from-top-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {fieldErrors.items && (
                <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-600 font-bold rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} /> El desglose de montos tiene inconsistencias: {fieldErrors.items.join(", ")}
                </div>
              )}

              {/* Formulario Superior (Detalles) */}
              <div className="flex flex-col gap-4">
                
                {isGlobal && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700 ml-1">Contrato a Abonar <span className="text-red-500">*</span></label>
                    <ContractSearch
                      selected={selectedContractId}
                      onSelect={(c: any) => setSelectedContractId(String(c.id))}
                    />
                    {renderFieldError("contractId")}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700 ml-1">Fecha de Pago <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={form.paidAt}
                      onChange={(e) => {
                        setForm({ ...form, paidAt: e.target.value });
                        if (submitAttempted) setSubmitAttempted(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        dateError || fieldErrors.paidAt ? "border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50/30" : "border-gray-300 focus:ring-gray-200 focus:border-black"
                      }`}
                    />
                    {(dateError || fieldErrors.paidAt) && (
                      <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-0.5 animate-pulse ml-1">
                        <AlertCircle size={12} /> {dateError || (fieldErrors.paidAt && fieldErrors.paidAt.join(", "))}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700 ml-1">Número de Ticket / Referencia</label>
                    <input
                      type="text"
                      placeholder="Ej. TCK-9823"
                      value={form.ticketNumber}
                      onChange={(e) => setForm({ ...form, ticketNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-black transition-all"
                    />
                    {renderFieldError("ticketNumber")}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700 ml-1">Método de Pago</label>
                    <select
                      value={form.paymentMethod}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-black transition-all cursor-pointer"
                    >
                      <option value="cash">Efectivo</option>
                      <option value="transfer">Transferencia</option>
                      <option value="card">Tarjeta</option>
                    </select>
                    {renderFieldError("paymentMethod")}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700 ml-1">Moneda</label>
                    <select
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-black transition-all cursor-pointer"
                    >
                      <option value="MXN">Pesos (MXN)</option>
                      <option value="USD">Dólares (USD)</option>
                    </select>
                    {renderFieldError("currency")}
                  </div>
                </div>

              </div>

              {/* Desglose de Pagos */}
              {activeContractId && contractItems.length > 0 && (
                <div className="mt-2">
                  <PaymentAllocationCard
                    items={contractItems}
                    formItems={form.items}
                    setForm={setForm}
                  />
                </div>
              )}

              {error && errorCode && Object.keys(fieldErrors).length === 0 && (
                <ErrorBox message={error} code={errorCode} />
              )}
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                onClick={closeForm}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-white sm:bg-transparent border border-gray-300 sm:border-transparent hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-6 py-2.5 text-sm font-medium rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black flex items-center justify-center ${
                  isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "text-white bg-gray-900 hover:bg-gray-800"
                }`}
              >
                {isSubmitting ? "Registrando Pago..." : "Confirmar Pago"}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}