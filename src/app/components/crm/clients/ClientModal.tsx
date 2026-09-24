"use client";

import { useState, useEffect, useRef } from "react";
import { AlertCircle, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newClient: any) => void;
};

export default function ClientModal({ isOpen, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  // ------------------------------------------------------------------
  // 🚀 MAGIA UX: Scroll Lock + Cierre al hacer clic fuera del modal
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleOutsideClick = (e: MouseEvent) => {
      // Si el clic fue directamente en el fondo oscuro, cerramos
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ------------------------------------------------------------------
  // 🛡️ VALIDACIONES ESTRICTAS (Frontend)
  // ------------------------------------------------------------------
  let nameError = "";
  if (submitAttempted && !form.name?.trim()) nameError = "El nombre es obligatorio.";

  let phoneError = "";
  if (submitAttempted && !form.phone?.trim()) {
    phoneError = "El teléfono es obligatorio.";
  } else if (form.phone && form.phone.length < 10) {
    phoneError = "Debe tener exactamente 10 dígitos.";
  }

  let emailError = "";
  if (submitAttempted && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    emailError = "El formato del correo no es válido.";
  }

  const isInvalid = !form.name?.trim() || !form.phone?.trim() || form.phone.length < 10 || !!emailError;

  const handlePhoneChange = (val: string) => {
    const onlyNumbers = val.replace(/\D/g, "");
    if (onlyNumbers.length <= 10) setForm({ ...form, phone: onlyNumbers });
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    setServerError("");
    if (isInvalid) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/company/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setServerError(errorData.error || "Error al crear el cliente.");
        setIsSubmitting(false);
        return;
      }

      const newClient = await res.json();
      
      // Limpiamos y cerramos
      setForm({ name: "", phone: "", email: "" });
      setSubmitAttempted(false);
      setIsSubmitting(false);
      onSuccess(newClient); 
    } catch (error) {
      setServerError("Error de conexión con el servidor.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      
      {/* Contenedor del Modal (Con Referencia para el clic exterior) */}
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 my-auto"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Registrar Nuevo Cliente</h3>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body del Formulario */}
        <div className="p-5 sm:p-6 flex flex-col gap-4 sm:gap-5">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600 font-semibold animate-in slide-in-from-top-2">
              <AlertCircle size={16} /> {serverError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700 ml-1">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Ej. Juan Pérez"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (submitAttempted) setSubmitAttempted(false);
              }}
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                nameError ? "border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50/30" : "border-gray-300 focus:ring-gray-200 focus:border-black"
              }`}
            />
            {nameError && (
              <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-0.5 animate-pulse ml-1">
                <AlertCircle size={12} /> {nameError}
              </span>
            )}
          </div>

          {/* Grid responsivo: 1 columna en móvil, 2 en pantallas medianas (sm) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700 ml-1">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ej. 6561234567"
                value={form.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  phoneError ? "border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50/30" : "border-gray-300 focus:ring-gray-200 focus:border-black"
                }`}
              />
              {phoneError && (
                <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-0.5 animate-pulse ml-1">
                  <AlertCircle size={12} /> {phoneError}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700 ml-1">Correo</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (submitAttempted) setSubmitAttempted(false);
                }}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  emailError ? "border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50/30" : "border-gray-300 focus:ring-gray-200 focus:border-black"
                }`}
              />
              {emailError && (
                <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-0.5 animate-pulse ml-1">
                  <AlertCircle size={12} /> {emailError}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer responsivo: botones apilados en móvil, alineados en desktop */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-white sm:bg-transparent border border-gray-300 sm:border-transparent hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (submitAttempted && isInvalid)}
            className={`w-full sm:w-auto px-6 py-2.5 text-sm font-medium rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black flex items-center justify-center ${
              isSubmitting || (submitAttempted && isInvalid)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "text-white bg-gray-900 hover:bg-gray-800"
            }`}
          >
            {isSubmitting ? "Guardando..." : "Guardar Cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}